'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProfessorSupervisionRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [capacity, setCapacity] = useState(8)

  async function load() {
    setLoading(true)
    try {
      const [requestsRes, studentsRes, capRes] = await Promise.all([
        fetch('/api/professor/supervision-requests', { cache: 'no-store' }),
        fetch('/api/professor/students', { cache: 'no-store' }),
        fetch('/api/professor/supervision-capacity', { cache: 'no-store' }),
      ])

      if (requestsRes.ok) setRequests((await requestsRes.json()).requests || [])
      if (studentsRes.ok) {
        const d = await studentsRes.json()
        setStudents(d.students || [])
      }
      if (capRes.ok) {
        const d = await capRes.json()
        setCapacity(d.capacity ?? 8)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

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
        await load()
        return
      }
      await load()
    } finally {
      setActionId(null)
    }
  }

  const current = students.length
  const available = Math.max(0, capacity - current)
  const atCapacity = available <= 0

  const statusColors: Record<string, string> = {
    pending: 'border-amber-200',
    accepted: 'border-emerald-200',
    rejected: 'border-red-200',
  }
  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Refusée',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
          Encadrement <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">& demandes</span>
        </h1>
        <p className="text-gray-600 text-lg">Vos étudiants encadrés et les nouvelles demandes d&apos;encadrement.</p>
      </div>

      {/* Capacity bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Étudiants encadrés :{' '}
            <span className={atCapacity ? 'text-amber-700' : 'text-emerald-700'}>
              {current} / {capacity}
            </span>
            {atCapacity
              ? <span className="text-amber-700 font-normal"> — capacité maximale atteinte</span>
              : <span className="text-gray-500 font-normal"> ({available} place{available !== 1 ? 's' : ''} disponible{available !== 1 ? 's' : ''})</span>
            }
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${atCapacity ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, (current / capacity) * 100)}%` }}
            />
          </div>
        </div>
        <Link
          href="/dashboard/professor/students"
          className="shrink-0 px-4 py-2 bg-gray-100 text-gray-800 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          Voir tous mes étudiants →
        </Link>
      </div>

      {/* Current students */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Mes étudiants encadrés
          <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-semibold">{current}</span>
        </h2>
        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((s: any) => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4 hover:border-emerald-200 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-base shrink-0 shadow">
                  {s.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{s.full_name || 'N/A'}</p>
                  <p className="text-gray-500 text-xs truncate">{s.email}</p>
                  {s.department && <p className="text-gray-400 text-xs capitalize mt-0.5">{s.department}</p>}
                  <p className="mt-2 text-xs text-gray-600 truncate">
                    {s.topic?.title
                      ? <span className="text-emerald-700 font-medium">{s.topic.title}</span>
                      : <span className="text-amber-600 italic">Pas encore de sujet</span>
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
            <p className="text-gray-500">Aucun étudiant encadré pour le moment.</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Capacity warning */}
      {atCapacity && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
          Capacité d&apos;encadrement atteinte. Vous ne pouvez plus accepter de nouvelles demandes.
        </div>
      )}

      {/* Supervision requests */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Demandes d&apos;encadrement
          <span className="ml-2 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-semibold">
            {requests.filter(r => r.status === 'pending').length} en attente
          </span>
        </h2>
        <div className="space-y-3">
          {requests.length > 0 ? requests.map((r) => {
            const s = r.student || {}
            const isPending = r.status === 'pending'
            const busy = actionId === r.id
            return (
              <div
                key={r.id}
                className={`bg-white rounded-2xl border shadow-sm ${statusColors[r.status] || 'border-gray-200'} p-5`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 font-bold text-sm shrink-0">
                      {s.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">{s.full_name || 'Étudiant'}</p>
                      <p className="text-gray-500 text-xs">{s.email}</p>
                      {s.department && <p className="text-gray-400 text-xs capitalize">{s.department}</p>}
                      {r.topic?.title && (
                        <p className="text-emerald-800 text-xs mt-2 font-medium">
                          Sujet (catalogue) : {r.topic.title}
                        </p>
                      )}
                      {r.suggested_topic_title && (
                        <p className="text-cyan-800 text-xs mt-1 font-medium">
                          Proposition de sujet : {r.suggested_topic_title}
                        </p>
                      )}
                      {!r.topic?.title && !r.suggested_topic_title && (
                        <p className="text-gray-500 text-xs mt-2 italic">Aucun sujet précisé</p>
                      )}
                      {r.message && (
                        <p className="text-gray-600 text-xs mt-1 whitespace-pre-wrap">&quot;{r.message}&quot;</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      r.status === 'accepted'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : r.status === 'rejected'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {statusLabels[r.status] || r.status}
                    </span>
                    {isPending && (
                      <>
                        <button
                          type="button"
                          disabled={busy || atCapacity}
                          onClick={() => respond(r.id, 'accepted')}
                          title={atCapacity ? 'Capacité atteinte' : undefined}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          }) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
              <p className="text-gray-500">Aucune demande d&apos;encadrement reçue.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
