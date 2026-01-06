'use client'

import { useState } from 'react'

export function SubmitTopicForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    // Design only - no API call
    setTimeout(() => {
      setLoading(false)
      setIsOpen(false)
    }, 1000)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5"
      >
        Proposer un sujet
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 w-full max-w-md p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl -mr-24 -mt-24" />
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Proposer un sujet</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-gray-400 hover:text-white transition-all duration-200 flex items-center justify-center border border-slate-600/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Titre du sujet
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none text-white placeholder:text-gray-500 transition-all duration-200"
                placeholder="Ex: Système de gestion..."
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none text-white placeholder:text-gray-500 resize-none transition-all duration-200"
                placeholder="Décrivez votre sujet de PFE..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-3 bg-slate-700/50 text-white rounded-xl hover:bg-slate-700 transition-all duration-200 font-semibold border border-slate-600/50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-emerald-500/25"
              >
                {loading ? 'Envoi...' : 'Soumettre'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

