'use client'

import { useState, useEffect } from 'react'

export default function ProfessorTopicApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function load() {
    try {
      const res = await fetch('/api/professor/supervised-topic-applications')
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function respond(app: any, status: 'approved' | 'rejected') {
    setError('')
    setActionId(app.id)
    try {
      const res = await fetch(`/api/professor/topics/${app.topic_id}/applications/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const j = await res.json()
        setError(j.error || 'Erreur')
        return
      }
      setApplications(prev => prev.map(a => (a.id === app.id ? { ...a, status } : a)))
    } finally {
      setActionId(null)
    }
  }

  const statusLabels: Record<string, string> = { pending: 'En attente', approved: 'Acceptée', rejected: 'Refusée' }

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
          Demandes de <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">sujets</span>
        </h1>
        <p className="text-gray-600 text-lg">
          Vos encadrés ont choisi des sujets (proposés par vous ou d&apos;autres professeurs). Acceptez ou refusez leurs demandes.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {applications.map((app) => {
          const s = app.student || {}
          const t = app.topic || {}
          const topicAuthor = t.professor && (Array.isArray(t.professor) ? t.professor[0] : t.professor)
          const isPending = app.status === 'pending'
          const busy = actionId === app.id
          return (
            <div
              key={app.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                app.status === 'approved' ? 'border-emerald-200' : app.status === 'rejected' ? 'border-red-200' : 'border-amber-200'
              }`}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-semibold">{s.full_name || 'Étudiant'}</p>
                    <p className="text-gray-600 text-sm">{s.email}</p>
                    {s.department && <p className="text-gray-500 text-sm">{s.department}</p>}
                    <p className="text-gray-900 font-medium mt-3 text-lg">{t.title || 'Sujet'}</p>
                    {topicAuthor && (
                      <p className="text-gray-500 text-sm">
                        Proposé par {topicAuthor.full_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        app.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : app.status === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {statusLabels[app.status] || app.status}
                    </span>
                    {isPending && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => respond(app, 'approved')}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {busy ? '…' : 'Accepter'}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => respond(app, 'rejected')}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 disabled:opacity-50"
                        >
                          Refuser
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {(t.description || t.requirements) && (
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                    {t.description && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Description du sujet</h4>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{t.description}</p>
                      </div>
                    )}
                    {t.requirements && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Prérequis</h4>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{t.requirements}</p>
                      </div>
                    )}
                    {t.department && (
                      <p className="text-gray-500 text-xs">Département : {t.department}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {applications.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-600">Aucune demande de sujet de la part de vos encadrés</p>
        </div>
      )}
    </div>
  )
}
