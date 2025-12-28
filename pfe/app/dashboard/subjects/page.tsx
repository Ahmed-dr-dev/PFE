import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SubjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold">
                  📚
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">ISAEG PFE</h1>
                  <p className="text-xs text-gray-400">Sujets disponibles</p>
                </div>
              </Link>
            </div>
            <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white">
              ← Retour
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Sujets de PFE Disponibles</h2>
          <p className="text-gray-400">Parcourez et choisissez votre sujet de projet</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Subject Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all">
            <div className="flex items-start justify-between mb-4">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                Informatique
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                Disponible
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">
              Développement d'une application mobile
            </h3>
            
            <p className="text-sm text-gray-400 mb-4">
              Création d'une application mobile pour la gestion des absences avec React Native
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Encadrant:</span>
                <span className="text-gray-300">Prof. Ahmed ALAMI</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Durée:</span>
                <span className="text-gray-300">4-6 mois</span>
              </div>
            </div>
            
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium transition-all">
              Choisir ce sujet
            </button>
          </div>

          {/* Empty state */}
          <div className="md:col-span-2 lg:col-span-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-white mb-2">Aucun sujet disponible pour le moment</h3>
            <p className="text-gray-400 mb-6">Les enseignants vont bientôt proposer des sujets de PFE</p>
            <Link
              href="/dashboard/my-pfe"
              className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all"
            >
              Proposer votre propre sujet
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

