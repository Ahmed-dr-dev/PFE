import { hashPasswordSecret } from '@/lib/auth/password-hash'
import { isValidRecoveryEmail, pickRecoveryDestination } from '@/lib/auth/recovery-email'
import { maskEmailForLog } from '@/lib/brevo-log'
import { sendBrevoTransactionalEmail } from '@/lib/brevo'
import { getServerAppUrl } from '@/lib/server-app-url'
import { getSupabaseForAdminData } from '@/lib/supabase/admin-server'
import { NextResponse } from 'next/server'

const FP = '[forgot-password]'

function generateToken(): string {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const PROFILE_COLS_FULL = 'id, email, full_name, recovery_email'
const PROFILE_COLS_FALLBACK = 'id, email, full_name'

function isMissingRecoveryColumnError(err: { message?: string; code?: string } | null | undefined): boolean {
  if (!err) return false
  return String(err.message || '').includes('recovery_email') || err.code === '42703'
}

/**
 * Trouve un profil par identifiant de connexion (profiles.email = CIN ou e-mail)
 * ou par e-mail de récupération (profiles.recovery_email), pour que l’étudiant puisse
 * taper l’adresse qu’il a renseignée en profil / admin.
 */
async function fetchProfileByIdentifier(
  supabase: Awaited<ReturnType<typeof getSupabaseForAdminData>>,
  identifier: string,
  cols: string
) {
  let { data, error } = await supabase.from('profiles').select(cols).eq('email', identifier).maybeSingle()
  if (error) return { data: null, error }
  if (data) return { data, error: null, matchedBy: 'email' as const }

  const r = await supabase.from('profiles').select(cols).ilike('email', identifier).maybeSingle()
  if (r.error) return { data: null, error: r.error }
  if (r.data) return { data: r.data, error: null, matchedBy: 'email_ilike' as const }

  if (!identifier.includes('@')) {
    return { data: null, error: null }
  }

  const norm = identifier.trim().toLowerCase()
  const q = await supabase.from('profiles').select(cols).eq('recovery_email', norm).maybeSingle()
  if (q.error) {
    if (isMissingRecoveryColumnError(q.error)) return { data: null, error: null }
    return { data: null, error: q.error }
  }
  if (q.data) return { data: q.data, error: null, matchedBy: 'recovery_email' as const }

  const q2 = await supabase.from('profiles').select(cols).ilike('recovery_email', identifier.trim()).maybeSingle()
  if (q2.error) {
    if (isMissingRecoveryColumnError(q2.error)) return { data: null, error: null }
    return { data: null, error: q2.error }
  }
  if (q2.data) return { data: q2.data, error: null, matchedBy: 'recovery_email_ilike' as const }

  return { data: null, error: null }
}

async function findProfile(
  supabase: Awaited<ReturnType<typeof getSupabaseForAdminData>>,
  identifier: string
): Promise<{ ok: true; profile: Record<string, unknown> | null } | { ok: false; message: string }> {
  let res = await fetchProfileByIdentifier(supabase, identifier, PROFILE_COLS_FULL)
  let data = res.data
  let error = res.error
  const missingCol = error && isMissingRecoveryColumnError(error as { message?: string; code?: string })
  if (missingCol) {
    res = await fetchProfileByIdentifier(supabase, identifier, PROFILE_COLS_FALLBACK)
    data = res.data
    error = res.error
  }
  if ('matchedBy' in res && res.matchedBy) {
    console.info(`${FP} profil trouvé via ${(res as { matchedBy: string }).matchedBy}`)
  }
  if (error) {
    const msg = String((error as { message?: string }).message || error)
    const errObj = error as { message?: string; code?: string; cause?: unknown }
    console.error(`${FP} findProfile Supabase error:`, msg, 'code=', errObj.code, 'cause=', errObj.cause)

    const network =
      /fetch failed|network|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|CERT_|SSL|TLS|getaddrinfo/i.test(msg) ||
      (errObj.cause != null &&
        String(errObj.cause).match(/fetch failed|ECONNREFUSED|ENOTFOUND|certificate/i))

    if (network) {
      return {
        ok: false,
        message:
          'Connexion à Supabase impossible (réseau). Vérifiez NEXT_PUBLIC_SUPABASE_URL dans .env, que le projet est actif, et votre connexion / pare-feu (erreur typique : fetch failed).',
      }
    }

    const rls =
      /permission denied|row-level security|rls|42501|policy/i.test(msg) ||
      errObj.code === '42501' ||
      errObj.code === 'PGRST301'

    if (rls) {
      return {
        ok: false,
        message:
          'Lecture du compte refusée (RLS). Ajoutez SUPABASE_SERVICE_ROLE_KEY côté serveur, ou exécutez supabase-migrations/disable-rls-profiles-password-reset.sql (risques si API exposée).',
      }
    }

    return {
      ok: false,
      message: `Erreur Supabase: ${msg.slice(0, 240)}`,
    }
  }
  return { ok: true, profile: data as Record<string, unknown> | null }
}

const PUBLIC_MSG =
  'Si un compte correspond à cet identifiant, un e-mail de réinitialisation vient d’être envoyé (vérifiez vos courriers indésirables).'

const NO_RECIPIENT_MSG =
  'Votre identifiant est bien reconnu, mais aucune adresse e-mail valide n’est enregistrée pour vous envoyer le lien. Si vous vous connectez avec un CIN, renseignez un « e-mail de récupération » dans votre profil (étudiant / enseignant) ou demandez à l’administration de l’ajouter sur votre fiche, puis réessayez.'

export async function POST(request: Request) {
  try {
    console.info(`${FP} requête reçue`)

    if (!process.env.BREVO_API_KEY?.trim() || !process.env.BREVO_SENDER_EMAIL?.trim()) {
      console.warn(`${FP} configuration Brevo incomplète (clé ou expéditeur manquant)`)
      return NextResponse.json(
        { error: 'Envoi d’e-mails non configuré : renseignez BREVO_API_KEY et BREVO_SENDER_EMAIL.' },
        { status: 503 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const raw = typeof body.email === 'string' ? body.email.trim() : ''
    if (!raw) {
      return NextResponse.json({ error: 'CIN / e-mail requis' }, { status: 400 })
    }

    console.info(`${FP} identifiant saisi: longueur=${raw.length}, contient@=${raw.includes('@')}`)

    const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    console.info(`${FP} Supabase: service_role=${usingServiceRole ? 'oui' : 'non (client anon/publishable)'}`)

    const supabase = await getSupabaseForAdminData()
    const found = await findProfile(supabase, raw)
    if (!found.ok) {
      console.error(`${FP} échec lecture profil:`, found.message)
      return NextResponse.json({ error: found.message }, { status: 503 })
    }
    const profile = found.profile

    if (!profile?.id) {
      console.info(`${FP} aucun profil pour cet identifiant — réponse générique (pas d’envoi)`)
      return NextResponse.json({
        success: true,
        message: PUBLIC_MSG,
        sent: null,
      })
    }

    const p = profile as { email?: string | null; recovery_email?: string | null }
    const re = String(p.recovery_email || '').trim()
    const pe = String(p.email || '').trim()
    console.info(
      `${FP} profil trouvé userId=${profile.id} recovery_email défini=${re.length > 0} (${re ? maskEmailForLog(re) : 'vide'}) profile.email ressemble à email=${pe.includes('@')}`
    )

    let emailTo = pickRecoveryDestination(p)
    if (!emailTo && raw.includes('@')) {
      const cand = raw.trim().toLowerCase()
      if (isValidRecoveryEmail(cand)) emailTo = cand
    }
    if (!emailTo) {
      console.warn(`${FP} pas d’adresse d’envoi valide après pickRecoveryDestination — pas d’appel Brevo`)
      return NextResponse.json({
        success: true,
        sent: false,
        message: NO_RECIPIENT_MSG,
      })
    }

    console.info(`${FP} envoi prévu vers ${maskEmailForLog(emailTo)}`)

    const plainToken = generateToken()
    const tokenHash = await hashPasswordSecret(plainToken)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    await supabase.from('password_reset_tokens').delete().eq('user_id', profile.id)

    const { error: insErr } = await supabase.from('password_reset_tokens').insert({
      user_id: profile.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })

    if (insErr) {
      console.error(`${FP} insert token échoué:`, insErr.code, insErr.message)
      if (insErr.message?.includes('password_reset_tokens') || insErr.code === '42P01') {
        return NextResponse.json(
          {
            error:
              'Table password_reset_tokens absente. Exécutez la migration supabase-migrations/password-reset-tokens.sql dans Supabase.',
          },
          { status: 503 }
        )
      }
      console.error('forgot-password insert:', insErr)
      const hint =
        /permission|rls|policy/i.test(insErr.message || '')
          ? ' Ajoutez SUPABASE_SERVICE_ROLE_KEY dans .env.local (recommandé) ou assouplissez les politiques RLS sur password_reset_tokens.'
          : ''
      return NextResponse.json(
        { error: `Erreur lors de l’enregistrement du jeton.${hint}` },
        { status: 500 }
      )
    }

    console.info(`${FP} jeton reset enregistré en base, expire=${expiresAt}`)

    const base = getServerAppUrl(request)
    console.info(`${FP} base URL lien reset=${base} (le jeton n’est pas loggé)`)
    const resetUrl = `${base}/auth/reset-password?token=${encodeURIComponent(plainToken)}`
    const name = escapeHtml(profile.full_name || 'Utilisateur')

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>Bonjour ${name},</p>
  <p>Vous avez demandé à réinitialiser votre mot de passe pour <strong>ISAEG PFE</strong>.</p>
  <p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Choisir un nouveau mot de passe</a></p>
  <p style="font-size:14px;color:#555;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/><span style="word-break:break-all;">${escapeHtml(resetUrl)}</span></p>
  <p style="font-size:14px;color:#555;">Ce lien expire dans <strong>1 heure</strong>. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.</p>
</body>
</html>`.trim()

    const text = `Bonjour,\n\nRéinitialisation du mot de passe ISAEG PFE : ${resetUrl}\n\nLe lien expire dans 1 heure.`

    const sent = await sendBrevoTransactionalEmail({
      toEmail: emailTo,
      toName: profile.full_name,
      subject: 'Réinitialisation de votre mot de passe — ISAEG PFE',
      htmlContent: html,
      textContent: text,
    })

    if (!sent.ok) {
      console.error(`${FP} Brevo a refusé ou échoué: status=${sent.status} detail=${sent.error}`)
      await supabase.from('password_reset_tokens').delete().eq('user_id', profile.id)
      return NextResponse.json(
        {
          error:
            "L’e-mail n’a pas pu être envoyé. Vérifiez dans Brevo : clé API (SMTP & API transactionnelle), expéditeur vérifié identique à BREVO_SENDER_EMAIL, et quotas.",
          brevoDetail: sent.error,
        },
        { status: 502 }
      )
    }

    console.info(`${FP} terminé avec succès API Brevo messageId=${sent.messageId || 'non fourni'}`)
    return NextResponse.json({ success: true, sent: true, message: PUBLIC_MSG })
  } catch (e) {
    console.error(`${FP} exception:`, e instanceof Error ? e.stack || e.message : e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
