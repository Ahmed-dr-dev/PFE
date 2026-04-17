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
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/isaeg.jpg" alt="ISAEG" width={120} height={48} className="h-11 w-auto object-contain" />
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <span className="hidden sm:block text-base font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Plateforme PFE
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a href="#contact-accueil" className="hidden sm:inline-flex text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Contact
            </a>
            <Link
              href="/auth/signin"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all font-semibold text-sm shadow-sm"
            >
              Connexion
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-white min-h-[min(80vh,720px)] flex items-center border-b border-gray-100">
          {/* Soft decorative blobs */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-50 to-cyan-50 rounded-full blur-3xl opacity-70 pointer-events-none -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none -ml-32 -mb-32" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28 w-full">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-sm font-semibold mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ISAEG — Institut Supérieur d&apos;Administration des Entreprises de Gafsa
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
                Gérez vos{' '}
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  projets de fin
                </span>
                <br />
                d&apos;études
              </h1>

              <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl">
                Une plateforme unifiée pour étudiants, enseignants et administration —
                sujets, encadrement, soutenances et suivi en un seul endroit.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-14">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-2xl hover:from-emerald-700 hover:to-cyan-700 transition-all font-bold text-base shadow-lg shadow-emerald-100"
                >
                  Accéder à la plateforme
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <a
                  href="#contact-accueil"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-base"
                >
                  Nous contacter
                </a>
              </div>

              {/* Stats strip */}
              <div className="flex flex-wrap gap-x-8 gap-y-4 border-t border-gray-100 pt-8">
                {[
                  { num: '3', label: 'Rôles utilisateurs' },
                  { num: '100%', label: 'En ligne' },
                  { num: '∞', label: 'Projets gérés' },
                ].map((s) => (
                  <div key={s.label} className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-gray-900">{s.num}</span>
                    <span className="text-sm text-gray-400 font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Roles ── */}
        <section className="py-20 bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3">À qui s&apos;adresse la plateforme</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Conçue pour chaque acteur du PFE</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  ),
                  role: 'Étudiant',
                  color: 'from-emerald-500 to-emerald-600',
                  bg: 'bg-emerald-50',
                  border: 'border-emerald-100',
                  features: ["Parcourir les sujets disponibles", "Soumettre une demande d'encadrement", "Suivre l'avancement de son PFE", 'Consulter les annonces et réunions'],
                },
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  role: 'Enseignant',
                  color: 'from-blue-500 to-blue-600',
                  bg: 'bg-blue-50',
                  border: 'border-blue-100',
                  features: ['Publier et gérer les sujets de PFE', "Accepter des demandes d'encadrement", 'Planifier des réunions de suivi', 'Valider les étudiants pour la soutenance'],
                },
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                  role: 'Administration',
                  color: 'from-purple-500 to-purple-600',
                  bg: 'bg-purple-50',
                  border: 'border-purple-100',
                  features: ['Tableau de bord global et statistiques', 'Affecter étudiants et encadrants', 'Planifier les soutenances et jurys', 'Gérer les comptes et paramètres'],
                },
              ].map((card) => (
                <div key={card.role} className={`bg-white border ${card.border} rounded-2xl p-7 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{card.role}</h3>
                    <ul className="space-y-2">
                      {card.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-gray-500">
                          <svg className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/auth/signin"
                    className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Se connecter
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LandingFeatures />

        {/* ── How it works ── */}
        <section className="py-20 bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3">Processus</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Comment ça marche</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { num: '01', title: 'Proposer', desc: "L'enseignant publie un sujet ou l'étudiant en propose un.", accent: 'border-emerald-200 bg-emerald-50', numColor: 'text-emerald-500' },
                { num: '02', title: 'Valider', desc: "L'administration valide le sujet et l'affectation.", accent: 'border-blue-200 bg-blue-50', numColor: 'text-blue-500' },
                { num: '03', title: 'Affecter', desc: "L'étudiant est encadré et son suivi commence.", accent: 'border-purple-200 bg-purple-50', numColor: 'text-purple-500' },
                { num: '04', title: 'Soutenir', desc: 'La date de soutenance est planifiée et le jury constitué.', accent: 'border-orange-200 bg-orange-50', numColor: 'text-orange-500' },
              ].map((step) => (
                <div key={step.num} className={`border ${step.accent} rounded-2xl p-6`}>
                  <span className={`text-4xl font-extrabold ${step.numColor} opacity-40`}>{step.num}</span>
                  <h4 className="text-lg font-bold text-gray-900 mt-3 mb-2">{step.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Prêt à commencer votre PFE ?
            </h2>
            <p className="text-gray-500 mb-10 text-lg">
              Connectez-vous à la plateforme ISAEG PFE et gérez votre projet de bout en bout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-2xl hover:from-emerald-700 hover:to-cyan-700 transition-all font-bold text-base shadow-lg shadow-emerald-100"
              >
                Se connecter
              </Link>
              <a
                href="#contact-accueil"
                className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-base"
              >
                Poser une question
              </a>
            </div>
          </div>
        </section>

        <LandingFaq />

        <LandingFooter />
      </main>
    </div>
  )
}
