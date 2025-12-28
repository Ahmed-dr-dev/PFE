import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MyStudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== 'teacher') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                  👨‍🏫
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">ISAEG PFE</h1>
                  <p className="text-xs text-gray-400">Mes Étudiants</p>
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
          <h2 className="text-3xl font-bold text-white mb-2">Étudiants Encadrés</h2>
          <p className="text-gray-400">Suivez l'avancement de vos étudiants</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-2xl font-bold text-white mb-1">0</p>
            <p className="text-sm text-gray-400">Étudiants assignés</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">🟢</div>
            <p className="text-2xl font-bold text-green-400 mb-1">0</p>
            <p className="text-sm text-gray-400">En cours</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-2xl font-bold text-yellow-400 mb-1">0</p>
            <p className="text-sm text-gray-400">En attente</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-2xl font-bold text-blue-400 mb-1">0</p>
            <p className="text-sm text-gray-400">Terminés</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">Liste des Étudiants</h3>
          </div>
          
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h4 className="text-lg font-semibold text-white mb-2">Aucun étudiant assigné</h4>
            <p className="text-gray-400 mb-6">
              Les étudiants vous seront assignés après validation de vos sujets
            </p>
          </div>

          {/* Sample student card - hidden by default */}
          <div className="hidden p-6 border-b border-white/10 hover:bg-white/5 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                  AB
                </div>
                <div>
                  <h4 className="text-white font-semibold">Ahmed BENNANI</h4>
                  <p className="text-sm text-gray-400">N° 2024001 • ahmed.bennani@isaeg.ma</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Sujet</p>
                  <p className="text-sm text-white font-medium">Application Mobile</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Statut</p>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                    En cours
                  </span>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all">
                  Voir Détails
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

