import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProposalsPage() {
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
                  <p className="text-xs text-gray-400">Mes Propositions</p>
                </div>
              </Link>
            </div>
            <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white">
              ← Retour
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Mes Sujets de PFE</h2>
            <p className="text-gray-400">Gérez vos propositions de sujets</p>
          </div>
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2">
            <span>+</span> Nouveau Sujet
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-2xl font-bold text-white mb-1">0</p>
            <p className="text-sm text-gray-400">Sujets proposés</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-2xl font-bold text-green-400 mb-1">0</p>
            <p className="text-sm text-gray-400">Sujets validés</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-2xl font-bold text-blue-400 mb-1">0</p>
            <p className="text-sm text-gray-400">Sujets assignés</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
          <h3 className="text-xl font-bold text-white mb-6">Proposer un Nouveau Sujet</h3>
          
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Titre du sujet
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-gray-400"
                placeholder="Ex: Application de gestion de bibliothèque"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Description détaillée
              </label>
              <textarea
                rows={5}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-gray-400"
                placeholder="Décrivez le projet, les objectifs, les technologies..."
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Domaine
                </label>
                <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                  <option value="" className="bg-slate-900">Sélectionnez</option>
                  <option value="informatique" className="bg-slate-900">Informatique</option>
                  <option value="gestion" className="bg-slate-900">Gestion</option>
                  <option value="finance" className="bg-slate-900">Finance</option>
                  <option value="marketing" className="bg-slate-900">Marketing</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Durée
                </label>
                <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white">
                  <option value="3-4" className="bg-slate-900">3-4 mois</option>
                  <option value="4-6" className="bg-slate-900">4-6 mois</option>
                  <option value="6+" className="bg-slate-900">6+ mois</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Places disponibles
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  defaultValue="1"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Compétences requises
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-gray-400"
                placeholder="Ex: Java, Spring Boot, MySQL"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-all"
            >
              Proposer ce sujet
            </button>
          </form>
        </div>

        <div className="mt-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Mes Sujets Proposés</h3>
          
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-400">Aucun sujet proposé pour le moment</p>
          </div>
        </div>
      </main>
    </div>
  )
}

