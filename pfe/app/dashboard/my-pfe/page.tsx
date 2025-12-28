import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MyPFEPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const role = user.user_metadata.role || 'student'

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
                  <p className="text-xs text-gray-400">Mon PFE</p>
                </div>
              </Link>
            </div>
            <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white">
              ← Retour
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {role === 'student' ? 'Proposer un Sujet de PFE' : 'Mon Projet de Fin d\'Études'}
          </h2>
          <p className="text-gray-400">Soumettez votre proposition de sujet</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Titre du sujet
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white placeholder:text-gray-400 backdrop-blur-sm"
                placeholder="Ex: Application de gestion des stages"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Description
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white placeholder:text-gray-400 backdrop-blur-sm"
                placeholder="Décrivez votre projet en détail..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Domaine
                </label>
                <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white backdrop-blur-sm">
                  <option value="" className="bg-slate-900">Sélectionnez</option>
                  <option value="informatique" className="bg-slate-900">Informatique</option>
                  <option value="gestion" className="bg-slate-900">Gestion</option>
                  <option value="finance" className="bg-slate-900">Finance</option>
                  <option value="marketing" className="bg-slate-900">Marketing</option>
                  <option value="rh" className="bg-slate-900">Ressources Humaines</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Durée estimée
                </label>
                <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white backdrop-blur-sm">
                  <option value="" className="bg-slate-900">Sélectionnez</option>
                  <option value="3-4" className="bg-slate-900">3-4 mois</option>
                  <option value="4-6" className="bg-slate-900">4-6 mois</option>
                  <option value="6+" className="bg-slate-900">6+ mois</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Technologies/Outils utilisés
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white placeholder:text-gray-400 backdrop-blur-sm"
                placeholder="Ex: React, Node.js, PostgreSQL"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Soumettre le sujet
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all text-center"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="font-semibold text-blue-300 text-sm mb-1">Information</p>
              <p className="text-sm text-gray-400">
                Votre proposition sera examinée par l'administration. Vous recevrez une notification une fois validée.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

