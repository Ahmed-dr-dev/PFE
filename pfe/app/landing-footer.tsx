import Link from 'next/link'

const DEFAULT_FAC_NAME = 'Institut supérieur d’administration des entreprises de Gafsa (ISAEG)'
const DEFAULT_FAC_ADDRESS =
  'Rue Houssine ben Kaddour, Sidi Ahmed Zarroug — 2112 Gafsa'
const DEFAULT_FAC_EMAIL = 'webmaster@isaeg.rnu.tn'
const DEFAULT_FAC_PHONE = '76 21 14 40'
const DEFAULT_FAC_FAX = '76 21 14 50'

function envTrim(key: string): string | undefined {
  const v = process.env[key]?.trim()
  return v || undefined
}

/** Téléphone tunisien affiché avec espaces → lien tel:+216… */
function tunisiaTelHref(display: string): string {
  const digits = display.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('216')) return `+${digits}`
  return `+216${digits}`
}

export function LandingFooter() {
  const facName = envTrim('NEXT_PUBLIC_FAC_NAME') ?? DEFAULT_FAC_NAME
  const facEmail = envTrim('NEXT_PUBLIC_FAC_CONTACT_EMAIL') ?? DEFAULT_FAC_EMAIL
  const facPhone = envTrim('NEXT_PUBLIC_FAC_CONTACT_PHONE') ?? DEFAULT_FAC_PHONE
  const facFax = envTrim('NEXT_PUBLIC_FAC_CONTACT_FAX') ?? DEFAULT_FAC_FAX
  const facAddress = envTrim('NEXT_PUBLIC_FAC_ADDRESS') ?? DEFAULT_FAC_ADDRESS
  const phoneHref = tunisiaTelHref(facPhone)
  const year = new Date().getFullYear()

  return (
    <footer id="contact-faculte" className="border-t border-slate-800 bg-slate-900 text-slate-300 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Contact faculté</h2>
          <p className="text-sm font-medium text-emerald-400/90">{facName}</p>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="text-slate-500 shrink-0 w-16">Adresse</span>
              <span className="text-slate-300">{facAddress}</span>
            </li>
            <li className="flex gap-2 items-baseline flex-wrap">
              <span className="text-slate-500 shrink-0 w-16">T.</span>
              {phoneHref ? (
                <a
                  href={`tel:${phoneHref}`}
                  className="text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
                >
                  {facPhone}
                </a>
              ) : (
                <span>{facPhone}</span>
              )}
            </li>
            <li className="flex gap-2 items-baseline flex-wrap">
              <span className="text-slate-500 shrink-0 w-16">F.</span>
              <span className="text-slate-300">{facFax}</span>
            </li>
            <li className="flex gap-2 items-baseline flex-wrap">
              <span className="text-slate-500 shrink-0 w-16">E-mail</span>
              <a
                href={`mailto:${facEmail}`}
                className="text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline break-all"
              >
                {facEmail}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight mb-4">Liens</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="#contact-accueil" className="text-slate-300 hover:text-white underline-offset-2 hover:underline">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/auth/signin" className="text-slate-300 hover:text-white underline-offset-2 hover:underline">
                Connexion
              </Link>
            </li>
            <li>
              <Link href="/" className="text-slate-300 hover:text-white underline-offset-2 hover:underline">
                Accueil
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© {year} ISAEG PFE</span>
          <span className="text-center sm:text-right">Plateforme de gestion des projets de fin d&apos;études</span>
        </div>
      </div>
    </footer>
  )
}
