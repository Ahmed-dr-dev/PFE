import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function StudentsManagementPage() {
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
                  <p className="text-xs text-gray-400">Gestion des Étudiants</p>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Gestion des Étudiants</h2>
            <p className="text-gray-400">Administrez les étudiants et leurs PFE</p>
          </div>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2">
            <span>+</span> Ajouter Étudiant
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-2xl font-bold text-white mb-1">0</p>
            <p className="text-sm text-gray-400">Total étudiants</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-2xl font-bold text-blue-400 mb-1">0</p>
            <p className="text-sm text-gray-400">Avec PFE</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-2xl font-bold text-yellow-400 mb-1">0</p>
            <p className="text-sm text-gray-400">En attente</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-2xl font-bold text-green-400 mb-1">0</p>
            <p className="text-sm text-gray-400">Terminés</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder:text-gray-400"
            />
            <select className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white">
              <option value="" className="bg-slate-900">Tous les statuts</option>
              <option value="pending" className="bg-slate-900">En attente</option>
              <option value="active" className="bg-slate-900">En cours</option>
              <option value="completed" className="bg-slate-900">Terminé</option>
            </select>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Étudiant</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">N° Étudiant</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">PFE</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Encadrant</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Statut</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-gray-400">Aucun étudiant enregistré</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

