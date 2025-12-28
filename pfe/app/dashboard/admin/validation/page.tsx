import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ValidationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold">
                  ⚙️
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">ISAEG PFE</h1>
                  <p className="text-xs text-gray-400">Validation des Sujets</p>
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
          <h2 className="text-3xl font-bold text-white mb-2">Validation des Sujets de PFE</h2>
          <p className="text-gray-400">Validez ou refusez les propositions de sujets</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-2xl font-bold text-yellow-400 mb-1">0</p>
            <p className="text-sm text-gray-400">En attente</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-2xl font-bold text-green-400 mb-1">0</p>
            <p className="text-sm text-gray-400">Validés</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">❌</div>
            <p className="text-2xl font-bold text-red-400 mb-1">0</p>
            <p className="text-sm text-gray-400">Refusés</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-2xl font-bold text-blue-400 mb-1">0</p>
            <p className="text-sm text-gray-400">Total</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Sujets en Attente de Validation</h3>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                0 en attente
              </span>
            </div>

            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h4 className="text-lg font-semibold text-white mb-2">Aucun sujet à valider</h4>
              <p className="text-gray-400">Les nouvelles propositions apparaîtront ici</p>
            </div>

            {/* Sample validation card - hidden by default */}
            <div className="hidden border border-yellow-500/20 rounded-xl p-6 bg-yellow-500/5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-white">Application de gestion de bibliothèque</h4>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Informatique</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    Développement d'une application web pour gérer les emprunts et retours de livres
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Proposé par:</span>
                      <span className="text-white">Prof. Ahmed ALAMI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Date:</span>
                      <span className="text-white">24/12/2024</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-all">
                  ✓ Valider
                </button>
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-all">
                  ✗ Refuser
                </button>
                <button className="px-6 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-medium transition-all">
                  Détails
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Historique des Validations</h3>
            
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-400">Aucun historique disponible</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

