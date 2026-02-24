'use client'

import { useState, useEffect } from 'react'

export default function ProfessorDefensesPage() {
  const [defenses, setDefenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/professor/defenses')
        if (res.ok) setDefenses((await res.json()).defenses || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statusLabels: Record<string, string> = { scheduled: 'Planifiée', completed: 'Terminée', cancelled: 'Annulée', postponed: 'Reportée' }
  const statusColors: Record<string, string> = { scheduled: 'border-emerald-500/50', completed: 'border-slate-600', cancelled: 'border-red-500/50', postponed: 'border-orange-500/50' }

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
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Soutenances</span>
        </h1>
        <p className="text-gray-400 text-lg">Soutenances de vos étudiants encadrés</p>
      </div>

      <div className="space-y-4">
        {defenses
          .sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || ''))
          .map((d) => {
            const pp = d.pfe_projects
            const student = pp?.student || {}
            const topic = pp?.topic || {}
            return (
              <div key={d.id} className={`bg-slate-800/50 rounded-2xl border ${statusColors[d.status] || 'border-slate-700/50'} p-6`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-white font-semibold">{student.full_name || student.name || 'N/A'}</p>
                    <p className="text-gray-400 text-sm">{topic.title || 'Sans sujet'}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {d.scheduled_date} {d.scheduled_time && `à ${d.scheduled_time}`} {d.room && `– ${d.room}`}
                    </p>
                    {d.jury_members?.length > 0 && <p className="text-gray-500 text-xs mt-1">Jury: {d.jury_members.join(', ')}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    d.status === 'scheduled' ? 'bg-emerald-500/20 text-emerald-400' :
                    d.status === 'completed' ? 'bg-slate-500/20 text-gray-400' :
                    d.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {statusLabels[d.status] || d.status}
                  </span>
                </div>
              </div>
            )
          })}
      </div>

      {defenses.length === 0 && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-12 text-center">
          <p className="text-gray-400">Aucune soutenance planifiée pour vos étudiants</p>
        </div>
      )}
    </div>
  )
}
