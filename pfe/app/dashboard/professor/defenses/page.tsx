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
  const statusColors: Record<string, string> = { scheduled: 'border-emerald-200', completed: 'border-gray-200', cancelled: 'border-red-200', postponed: 'border-orange-500/50' }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Soutenances</span>
        </h1>
        <p className="text-gray-600 text-lg">Soutenances de vos étudiants encadrés</p>
      </div>

      <div className="space-y-4">
        {defenses
          .sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || ''))
          .map((d) => {
            const pp = d.pfe_projects
            const student = pp?.student || {}
            const topic = pp?.topic || {}
            return (
              <div key={d.id} className={`bg-white rounded-2xl border shadow-sm ${statusColors[d.status] || 'border-gray-200'} p-6`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-gray-900 font-semibold">{student.full_name || student.name || 'N/A'}</p>
                    <p className="text-gray-600 text-sm">{topic.title || 'Sans sujet'}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {d.scheduled_date} {d.scheduled_time && `à ${d.scheduled_time}`} {d.room && `– ${d.room}`}
                    </p>
                    {d.jury_members?.length > 0 && <p className="text-gray-500 text-xs mt-1">Jury: {d.jury_members.join(', ')}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    d.status === 'scheduled' ? 'bg-emerald-50 text-emerald-700' :
                    d.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                    d.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {statusLabels[d.status] || d.status}
                  </span>
                </div>
              </div>
            )
          })}
      </div>

      {defenses.length === 0 && (
        <div className="bg-white rounded-2xl border shadow-sm border-gray-200 p-12 text-center">
          <p className="text-gray-600">Aucune soutenance planifiée pour vos étudiants</p>
        </div>
      )}
    </div>
  )
}
