'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewTopicPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    department: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // TODO: Implement API call
    setTimeout(() => {
      setLoading(false)
      router.push('/dashboard/professor/topics')
    }, 1000)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Proposer un <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">sujet</span>
          </h1>
          <p className="text-gray-400 text-lg">Créez un nouveau sujet de PFE pour les étudiants</p>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-300 mb-2">
              Titre du sujet *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              placeholder="Ex: Système de gestion de bibliothèque"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              placeholder="Décrivez en détail le sujet de PFE, les objectifs, et les livrables attendus..."
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-semibold text-gray-300 mb-2">
              Prérequis et compétences requises
            </label>
            <textarea
              id="requirements"
              rows={4}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              placeholder="Listez les compétences techniques et prérequis nécessaires..."
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-semibold text-gray-300 mb-2">
              Département
            </label>
            <select
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            >
              <option value="">Sélectionner un département</option>
              <option value="informatique">Informatique</option>
              <option value="gestion">Gestion</option>
              <option value="comptabilite">Comptabilité</option>
            </select>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer le sujet'}
            </button>
            <Link
              href="/dashboard/professor/topics"
              className="px-6 py-3 bg-slate-700/50 text-white rounded-xl hover:bg-slate-700 transition-all duration-200 font-semibold text-sm"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}


