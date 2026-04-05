const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidRecoveryEmail(s: string): boolean {
  const t = s.trim().toLowerCase()
  return t.length > 0 && t.length <= 320 && EMAIL_RE.test(t)
}

export type RecoveryEmailParse =
  | { kind: 'omit' }
  | { kind: 'clear' }
  | { kind: 'set'; email: string }
  | { kind: 'invalid'; message: string }

/** Corps JSON : champ absent = ne pas modifier ; null ou "" = effacer. */
export function parseRecoveryEmailBody(value: unknown): RecoveryEmailParse {
  if (value === undefined) return { kind: 'omit' }
  if (value === null) return { kind: 'clear' }
  if (typeof value !== 'string') return { kind: 'invalid', message: 'E-mail invalide' }
  const t = value.trim().toLowerCase()
  if (!t) return { kind: 'clear' }
  if (!isValidRecoveryEmail(t)) return { kind: 'invalid', message: 'E-mail invalide' }
  return { kind: 'set', email: t }
}

export function pickRecoveryDestination(profile: {
  email?: string | null
  recovery_email?: string | null
}): string | null {
  const r = String(profile.recovery_email || '').trim().toLowerCase()
  if (r && isValidRecoveryEmail(r)) return r
  const e = String(profile.email || '').trim().toLowerCase()
  if (e && isValidRecoveryEmail(e)) return e
  return null
}
