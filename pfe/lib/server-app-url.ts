/** URL publique de l’app pour les liens dans les e-mails (réinit. mot de passe, etc.). */
export function getServerAppUrl(request: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  if (env) return env
  const origin = request.headers.get('origin')
  if (origin) return origin.replace(/\/$/, '')
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') || 'http'
  if (host) return `${proto}://${host}`.replace(/\/$/, '')
  return 'http://localhost:3000'
}
