'use client'

import { useState, useEffect } from 'react'

export default function ProfessorSupervisionRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function load() {
    try {
      const res = await fetch('/api/professor/supervision-requests')
      if (res.ok) setRequests((await res.json()).requests || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function respond(id: string, status: 'accepted' | 'rejected') {
    setError('')
    setActionId(id)
    try {
      const res = await fetch(`/api/professor/supervision-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const j = await res.json()
      if (!res.ok) {
        setError(j.error || 'Erreur')
        return
      }
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } finally {
      setActionId(null)
    }
  }

  const statusLabels: Record<string, string> = { pending: 'En attente', accepted: 'Acceptée', rejected: 'Refusée' }
  const statusColors: Record<string, string> = { pending: 'border-amber-200', accepted: 'border-emerald-200', rejected: 'border-red-200' }

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
          Demandes <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">d&apos;encadrement</span>
        </h1>
        <p className="text-gray-600 text-lg">Les étudiants vous demandent de les superviser. Acceptez ou refusez chaque demande.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {requests.map((r) => {
          const s = r.student || {}
          const isPending = r.status === 'pending'
          const busy = actionId === r.id
          return (
            <div key={r.id} className={`bg-white rounded-2xl border shadow-sm ${statusColors[r.status] || 'border-gray-200'} p-6`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-gray-900 font-semibold">{s.full_name || 'Étudiant'}</p>
                  <p className="text-gray-600 text-sm">{s.email}</p>
                  {s.department && <p className="text-gray-500 text-sm">{s.department}</p>}
                  {r.message && <p className="text-gray-600 text-sm mt-2 italic">&quot;{r.message}&quot;</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${r.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : r.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                    {statusLabels[r.status] || r.status}
                  </span>
                  {isPending && (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => respond(r.id, 'accepted')}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {busy ? '…' : 'Accepter'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => respond(r.id, 'rejected')}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 disabled:opacity-50"
                      >
                        Refuser
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {requests.length === 0 && (
        <div className="bg-white rounded-2xl border shadow-sm border-gray-200 p-12 text-center">
          <p className="text-gray-600">Aucune demande d&apos;encadrement</p>
        </div>
      )}
    </div>
  )
}
