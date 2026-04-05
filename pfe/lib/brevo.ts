/**
 * Envoi d’e-mails transactionnels via l’API Brevo (https://developers.brevo.com).
 *
 * Variables d’environnement :
 * - BREVO_API_KEY : clé API (Transactionnel)
 * - BREVO_SENDER_EMAIL : expéditeur vérifié dans Brevo
 * - BREVO_SENDER_NAME : optionnel, défaut « ISAEG PFE »
 * - BREVO_DEBUG=true : logs détaillés (sinon déjà un minimum en dev via NODE_ENV)
 */

import { brevoDebugEnabled, maskEmailForLog } from '@/lib/brevo-log'

const BREVO_API = 'https://api.brevo.com/v3/smtp/email'

const LOG = '[Brevo]'

export type BrevoSendResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: string; status?: number }

export async function sendBrevoTransactionalEmail(params: {
  toEmail: string
  toName?: string | null
  subject: string
  htmlContent: string
  textContent?: string
}): Promise<BrevoSendResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim()
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'ISAEG PFE'

  if (!apiKey) {
    console.warn(`${LOG} env: BREVO_API_KEY manquant`)
    return { ok: false, error: 'BREVO_API_KEY manquant' }
  }
  if (!senderEmail) {
    console.warn(`${LOG} env: BREVO_SENDER_EMAIL manquant`)
    return { ok: false, error: 'BREVO_SENDER_EMAIL manquant (expéditeur vérifié dans Brevo)' }
  }

  const debug = brevoDebugEnabled()
  console.info(`${LOG} env: apiKey présent (longueur ${apiKey.length}), expéditeur=${senderEmail}, debug=${debug}`)

  const toAddr = params.toEmail.trim().toLowerCase()
  const toEntry: { email: string; name?: string } = { email: toAddr }
  const n = params.toName?.trim()
  if (n) toEntry.name = n

  const body = {
    sender: { name: senderName.slice(0, 70), email: senderEmail.trim() },
    to: [toEntry],
    subject: params.subject,
    htmlContent: params.htmlContent,
    ...(params.textContent ? { textContent: params.textContent } : {}),
  }

  console.info(
    `${LOG} envoi → destinataire=${maskEmailForLog(toAddr)} sujet="${params.subject.slice(0, 80)}" htmlBytes≈${params.htmlContent.length}`
  )
  if (debug) {
    console.info(`${LOG} payload (sans html):`, {
      sender: body.sender,
      to: body.to.map((t) => ({ ...t, email: maskEmailForLog(t.email) })),
      subject: body.subject,
    })
  }

  try {
    const res = await fetch(BREVO_API, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(body),
    })

    const raw = await res.text().catch(() => '')

    console.info(`${LOG} réponse HTTP ${res.status}, corps longueur=${raw.length}`)

    if (!res.ok) {
      let message = `Brevo HTTP ${res.status}`
      try {
        const j = JSON.parse(raw) as { message?: string; code?: string }
        if (j.message) message = j.code ? `${j.code}: ${j.message}` : j.message
        console.error(`${LOG} erreur JSON:`, j)
      } catch {
        if (raw) message = raw.slice(0, 500)
        console.error(`${LOG} erreur corps brut (500 premiers car.):`, raw.slice(0, 500))
      }
      return { ok: false, error: message, status: res.status }
    }

    let messageId: string | undefined
    try {
      const j = JSON.parse(raw) as { messageId?: string; messageIds?: string[] }
      if (j.messageId) messageId = j.messageId
      if (!messageId && Array.isArray(j.messageIds) && j.messageIds.length > 0) {
        messageId = j.messageIds[0]
      }
      if (debug && raw) console.info(`${LOG} corps succès JSON:`, raw.slice(0, 500))
    } catch {
      console.warn(`${LOG} succès HTTP ${res.status} mais corps non-JSON ou vide`)
    }
    if (messageId) {
      console.info(`${LOG} accepté par l’API — messageId=${messageId} (suivre dans Brevo → Logs → Emails)`)
    } else {
      console.warn(
        `${LOG} succès HTTP ${res.status} sans messageId dans le corps — vérifier le tableau de bord Brevo et les filtres anti-spam côté destinataire`
      )
    }
    return { ok: true, messageId }
  } catch (e) {
    console.error(`${LOG} exception fetch:`, e instanceof Error ? e.stack || e.message : e)
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur réseau Brevo' }
  }
}
