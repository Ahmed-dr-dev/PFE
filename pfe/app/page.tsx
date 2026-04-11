import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LandingFeatures } from './landing-features'
import { LandingFooter } from './landing-footer'
import { LandingFaq } from './landing-faq'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/isaeg.jpg" alt="ISAEG" width={160} height={64} className="h-14 w-auto object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">ISAEG PFE</span>
          </Link>
          <Link
            href="/auth/signin"
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all font-medium text-sm"
          >
            Connexion
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero — photo de fond + overlay pour le contraste */}
        <section className="relative min-h-[min(88vh,820px)] md:min-h-[min(90vh,900px)] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/download%20(9).jpg"
              alt="Remise des diplômes — célébration des étudiants"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Overlay : assombrit surtout à gauche (texte) tout en laissant respirer la photo */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-900/65 to-slate-900/35"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-900/25"
              aria-hidden
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28 w-full">
            <div className="max-w-2xl">
              <div className="inline-block px-4 py-2 bg-white/10 text-emerald-200 border border-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
                Plateforme de gestion PFE
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-sm">
                Gérez vos projets de fin d&apos;études avec{' '}
                <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  simplicité
                </span>
              </h2>
              <p className="text-lg md:text-xl text-slate-200 mb-10 leading-relaxed max-w-xl">
                Une solution moderne pour étudiants, enseignants et administration
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signin"
                  className="inline-flex justify-center px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:from-emerald-400 hover:to-cyan-400 transition-all font-semibold shadow-lg shadow-emerald-950/30"
                >
                  Commencer maintenant
                </Link>
                <Link
                  href="/auth/signin"
                  className="inline-flex justify-center px-6 py-3.5 bg-white/10 text-white border-2 border-white/30 rounded-xl hover:bg-white/15 backdrop-blur-sm transition-all font-semibold"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </section>

        <LandingFeatures />

        {/* Process - Minimal */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Comment ça marche</h3>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {[
                { num: '1', text: 'Proposer' },
                { num: '2', text: 'Valider' },
                { num: '3', text: 'Affecter' },
                { num: '4', text: 'Suivre' },
              ].map((step, index) => (
                <div key={index} className="flex-1 text-center relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg">
                    {step.num}
                  </div>
                  <p className="text-gray-700 font-medium">{step.text}</p>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-emerald-300 to-cyan-300 transform -translate-x-1/2" style={{ width: 'calc(100% - 4rem)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA - Minimal */}
        <section className="py-20 bg-white border-t border-gray-200">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Prêt à commencer ?
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Rejoignez la plateforme ISAEG PFE dès aujourd'hui
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all font-semibold shadow-lg"
              >
                Se connecter
              </Link>
              <Link
                href="/auth/signin"
                className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all font-semibold"
              >
                Obtenir des identifiants
              </Link>
            </div>
          </div>
        </section>

        <LandingFaq />

        <LandingFooter />
      </main>
    </div>
  )
}
