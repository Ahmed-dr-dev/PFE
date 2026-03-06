'use client'

import { useState, useEffect } from 'react'

export default function ProfessorInternshipRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/professor/internship-requests')
        if (res.ok) setRequests((await res.json()).requests || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statusLabels: Record<string, string> = { pending: 'En attente', approved: 'Approuvée', rejected: 'Rejetée' }
  const statusColors: Record<string, string> = { pending: 'border-orange-500/50', approved: 'border-emerald-200', rejected: 'border-red-200' }

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
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Demandes de stage</span>
        </h1>
        <p className="text-gray-600 text-lg">Demandes de stage de vos étudiants encadrés</p>
      </div>

      <div className="space-y-4">
        {requests.map((r) => {
          const s = r.student || {}
          return (
            <div key={r.id} className={`bg-white rounded-2xl border shadow-sm ${statusColors[r.status] || 'border-gray-200'} p-6`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-gray-900 font-semibold">{s.full_name || s.name || 'N/A'}</p>
                  <p className="text-gray-600 text-sm">{s.email}</p>
                  <p className="text-gray-500 text-sm mt-1">{r.company} – {r.position}</p>
                  {r.start_date && <p className="text-gray-500 text-xs">{r.start_date} → {r.end_date || '—'}</p>}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : r.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                  {statusLabels[r.status] || r.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {requests.length === 0 && (
        <div className="bg-white rounded-2xl border shadow-sm border-gray-200 p-12 text-center">
          <p className="text-gray-600">Aucune demande de stage pour vos étudiants</p>
        </div>
      )}
    </div>
  )
}
