import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">ISAEG PFE</h1>
          <Link
            href="/auth/signin"
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all font-medium text-sm"
          >
            Connexion
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-sm font-semibold mb-6">
                  Plateforme de gestion PFE
                </div>
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Gérez vos projets de fin d'études avec{' '}
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">simplicité</span>
                </h2>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Une solution moderne pour étudiants, enseignants et administration
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/auth/signin"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all font-semibold shadow-lg"
                  >
                    Commencer maintenant
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-6 py-3 bg-slate-800/50 border-2 border-slate-700/50 text-white rounded-lg hover:border-slate-600/50 transition-all font-semibold"
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="relative w-full max-w-lg">
                  <Image
                    src="/pngtree-books-and-graduat-hat-png-image_3442925-removebg-preview.png"
                    alt="Books and graduation hat illustration"
                    width={600}
                    height={500}
                    className="w-full h-auto drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features - Compact Grid */}
        <section className="py-16 bg-slate-900/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-3">Fonctionnalités</h3>
              <p className="text-gray-400">Tout ce dont vous avez besoin</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: '📋', title: 'Sujets', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                { icon: '👥', title: 'Encadrement', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                { icon: '📊', title: 'Suivi', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
                { icon: '📅', title: 'Calendrier', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-emerald-500/50 transition-all text-center"
                >
                  <div className={`w-16 h-16 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl border`}>
                    {item.icon}
                  </div>
                  <h4 className="font-semibold text-white">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process - Minimal */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-3">Comment ça marche</h3>
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
                  <p className="text-gray-300 font-medium">{step.text}</p>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-emerald-500/50 to-cyan-500/50 transform -translate-x-1/2" style={{ width: 'calc(100% - 4rem)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      

        {/* CTA - Minimal */}
        <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900 border-t border-slate-700/50">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à commencer ?
            </h3>
            <p className="text-gray-400 mb-8 text-lg">
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
                href="/auth/signup"
                className="px-8 py-3 bg-slate-800/50 border-2 border-slate-700/50 text-white rounded-lg hover:border-slate-600/50 transition-all font-semibold"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </section>
      </main>

     
    </div>
  )
}
