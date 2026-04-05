/** Masque une adresse pour les logs (ex. ab***@domain.com). */
export function maskEmailForLog(email: string): string {
  const t = email.trim().toLowerCase()
  const at = t.indexOf('@')
  if (at < 1) return '(invalide)'
  const user = t.slice(0, at)
  const domain = t.slice(at + 1)
  const u =
    user.length <= 2 ? `${user[0] || '?'}*` : `${user.slice(0, 2)}***${user.length > 4 ? user.slice(-1) : ''}`
  return `${u}@${domain}`
}

export function brevoDebugEnabled(): boolean {
  return process.env.BREVO_DEBUG === '1' || process.env.BREVO_DEBUG === 'true' || process.env.NODE_ENV === 'development'
}
