import { hashPasswordSecret } from '@/lib/auth/password-hash'
import { getSupabaseForAdminData } from '@/lib/supabase/admin-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!token || !password) {
      return NextResponse.json({ error: 'Jeton et nouveau mot de passe requis' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
    }

    const supabase = await getSupabaseForAdminData()
    const tokenHash = await hashPasswordSecret(token)
    const nowIso = new Date().toISOString()

    const { data: row, error: selErr } = await supabase
      .from('password_reset_tokens')
      .select('id, user_id')
      .eq('token_hash', tokenHash)
      .gt('expires_at', nowIso)
      .maybeSingle()

    if (selErr) {
      if (selErr.message?.includes('password_reset_tokens') || selErr.code === '42P01') {
        return NextResponse.json(
          {
            error:
              'Table password_reset_tokens absente. Exécutez la migration supabase-migrations/password-reset-tokens.sql dans Supabase.',
          },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: selErr.message }, { status: 500 })
    }

    if (!row?.user_id) {
      return NextResponse.json(
        { error: 'Lien invalide ou expiré. Demandez un nouvel e-mail depuis la page « Mot de passe oublié ».' },
        { status: 400 }
      )
    }

    const newHash = await hashPasswordSecret(password)

    const { error: updErr } = await supabase
      .from('profiles')
      .update({ password: newHash, updated_at: nowIso })
      .eq('id', row.user_id)

    if (updErr) {
      console.error('reset-password profile update:', updErr)
      const hint =
        /permission|rls|policy/i.test(updErr.message || '')
          ? ' Configurez SUPABASE_SERVICE_ROLE_KEY côté serveur (clé « service_role » Supabase) pour autoriser la mise à jour du mot de passe.'
          : ''
      return NextResponse.json({ error: `Impossible de mettre à jour le mot de passe.${hint}` }, { status: 500 })
    }

    await supabase.from('password_reset_tokens').delete().eq('user_id', row.user_id)

    return NextResponse.json({ success: true, message: 'Mot de passe mis à jour. Vous pouvez vous connecter.' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
