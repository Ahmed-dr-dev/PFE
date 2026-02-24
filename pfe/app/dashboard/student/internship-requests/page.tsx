'use client'

import { useState, useEffect } from 'react'

export default function StudentInternshipRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ company: '', position: '', description: '', start_date: '', end_date: '' })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/student/internship-requests')
        if (res.ok) setRequests((await res.json()).requests || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/student/internship-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, start_date: form.start_date || null, end_date: form.end_date || null }),
      })
      if (res.ok) {
        const data = await res.json()
        setRequests([data.request, ...requests])
        setShowForm(false)
        setForm({ company: '', position: '', description: '', start_date: '', end_date: '' })
      } else {
        alert((await res.json()).error)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const statusLabels: Record<string, string> = { pending: 'En attente', approved: 'Approuvée', rejected: 'Rejetée' }
  const statusColors: Record<string, string> = { pending: 'border-orange-500/50', approved: 'border-emerald-500/50', rejected: 'border-red-500/50' }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Demandes de stage</span>
          </h1>
          <p className="text-gray-400 text-lg">Mes demandes de stage</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-semibold"
        >
          {showForm ? 'Annuler' : 'Nouvelle demande'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Nouvelle demande de stage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Entreprise</label>
              <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" placeholder="Nom de l'entreprise" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Poste</label>
              <input required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" placeholder="Intitulé du poste" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" placeholder="Description (optionnel)" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date début</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date fin</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold">Envoyer</button>
        </form>
      )}

      <div className="space-y-4">
        {requests.map((r) => (
          <div key={r.id} className={`bg-slate-800/50 rounded-2xl border ${statusColors[r.status] || 'border-slate-700/50'} p-6`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-gray-500 text-sm">{r.company} – {r.position}</p>
                {r.description && <p className="text-gray-400 text-sm mt-1">{r.description}</p>}
                {r.start_date && <p className="text-gray-500 text-xs mt-1">{r.start_date} → {r.end_date || '—'}</p>}
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${r.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : r.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                {statusLabels[r.status] || r.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && !showForm && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-12 text-center">
          <p className="text-gray-400">Aucune demande de stage</p>
        </div>
      )}
    </div>
  )
}
