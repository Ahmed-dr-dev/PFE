'use client'

import { useCallback, useEffect, useState } from 'react'

type Defense = any & { myRole?: 'encadrant' | 'rapporteur' }

function normalizeProject(d: Defense) {
  const pp = d.pfe_projects || d.pfe_project
  if (!pp) return { student: {}, topic: {} }
  const student = pp.student && (Array.isArray(pp.student) ? pp.student[0] : pp.student)
  const topic = pp.topic && (Array.isArray(pp.topic) ? pp.topic[0] : pp.topic)
  return { student: student || {}, topic: topic || {} }
}

export default function ProfessorDefensesPage() {
  const [defenses, setDefenses] = useState<Defense[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [supervisorRes, rapporteurRes] = await Promise.all([
        fetch('/api/professor/defenses', { cache: 'no-store' }),
        fetch('/api/professor/rapporteur-defenses', { cache: 'no-store' }),
      ])
      const supervisorDefs: Defense[] = supervisorRes.ok ? (await supervisorRes.json()).defenses || [] : []
      const rapporteurDefsRaw: Defense[] = rapporteurRes.ok ? (await rapporteurRes.json()).defenses || [] : []
      const supervisorWithRole = supervisorDefs.map((d) => ({ ...d, myRole: 'encadrant' as const }))
      const rapporteurWithRole = rapporteurDefsRaw.map((d) => ({
        ...d,
        myRole: 'rapporteur' as const,
        pfe_projects: d.pfe_project,
      }))
      const seen = new Set<string>(supervisorWithRole.map((d) => d.id))
      const merged = [...supervisorWithRole, ...rapporteurWithRole.filter((d) => !seen.has(d.id))]
      merged.sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || ''))
      setDefenses(merged)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

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
        <p className="text-gray-600 text-lg">
          Soutenances où vous êtes encadrant ou rapporteur du jury
        </p>
      </div>

      <div className="space-y-4">
        {defenses.map((d) => {
          const { student, topic } = normalizeProject(d)
          return (
            <div key={d.id} className={`bg-white rounded-2xl border shadow-sm ${statusColors[d.status] || 'border-gray-200'} p-6`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-gray-900 font-semibold">{student.full_name || student.name || 'N/A'}</p>
                  <p className="text-gray-600 text-sm">{topic.title || 'Sans sujet'}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {d.scheduled_date} {d.scheduled_time && `à ${String(d.scheduled_time).slice(0, 5)}`}
                    {d.duration_minutes != null && ` · ${d.duration_minutes} min`}
                    {d.room && ` — ${d.room}`}
                  </p>
                  {d.jury_members?.length > 0 && (
                    <div className="text-gray-500 text-xs mt-2 space-y-0.5">
                      {d.jury_members[0] && (
                        <p><span className="font-medium text-gray-600">Encadrant :</span> {d.jury_members[0]}</p>
                      )}
                      {d.jury_members[1] && (
                        <p><span className="font-medium text-violet-700">Rapporteur :</span> {d.jury_members[1]}</p>
                      )}
                      {d.jury_members[2] && (
                        <p><span className="font-medium text-amber-700">Président :</span> {d.jury_members[2]}</p>
                      )}
                    </div>
                  )}
                  {d.note != null && d.note !== undefined && (
                    <p className="text-sm font-semibold text-emerald-700 mt-2">Note finale : {d.note} / 20</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      d.myRole === 'rapporteur' ? 'bg-violet-50 text-violet-800 border border-violet-200' : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                    }`}
                  >
                    {d.myRole === 'rapporteur' ? 'Rapporteur' : 'Encadrant'}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      d.status === 'scheduled' ? 'bg-emerald-50 text-emerald-700' :
                      d.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                      d.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                    }`}
                  >
                    {statusLabels[d.status] || d.status}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {defenses.length === 0 && (
        <div className="bg-white rounded-2xl border shadow-sm border-gray-200 p-12 text-center">
          <p className="text-gray-600">Aucune soutenance planifiée</p>
        </div>
      )}
    </div>
  )
}
