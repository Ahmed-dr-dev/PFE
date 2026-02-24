'use client'

import { useState, useEffect } from 'react'

export default function ProfessorCommunicationPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/announcements')
        if (res.ok) setAnnouncements((await res.json()).announcements || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const targetLabels: Record<string, string> = { all: 'Tous', students: 'Étudiants', professors: 'Enseignants' }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Communication</span>
        </h1>
        <p className="text-gray-400 text-lg">Annonces et actualités</p>
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
            <p className="text-white font-semibold">{a.title}</p>
            <p className="text-gray-400 text-sm mt-1 whitespace-pre-wrap">{a.content}</p>
            <p className="text-gray-500 text-xs mt-2">
              {targetLabels[a.target_audience] || a.target_audience} • {new Date(a.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        ))}
      </div>

      {announcements.length === 0 && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-12 text-center">
          <p className="text-gray-400">Aucune annonce</p>
        </div>
      )}
    </div>
  )
}
