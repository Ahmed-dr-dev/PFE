'use client'

import { useState, useEffect } from 'react'

export default function InternshipRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState({ student_id: '', company: '', position: '', description: '', start_date: '', end_date: '' })

  useEffect(() => {
    async function load() {
      try {
        const [reqRes, stuRes] = await Promise.all([
          fetch('/api/admin/internship-requests'),
          fetch('/api/admin/students'),
        ])
        if (reqRes.ok) setRequests((await reqRes.json()).requests || [])
        if (stuRes.ok) setStudents((await stuRes.json()).students || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/internship-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      if (res.ok) setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)))
    } catch (e) {
      console.error(e)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/internship-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })
      if (res.ok) setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)))
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/internship-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, start_date: form.start_date || null, end_date: form.end_date || null }),
      })
      if (res.ok) {
        const data = await res.json()
        setRequests([data.request, ...requests])
        setShowForm(false)
        setForm({ student_id: '', company: '', position: '', description: '', start_date: '', end_date: '' })
      } else {
        alert((await res.json()).error)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = requests.filter((r) => statusFilter === 'all' || r.status === statusFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Demandes de stage</span>
          </h1>
          <p className="text-gray-600 text-lg">Gérer les demandes de stage des étudiants</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-semibold"
        >
          {showForm ? 'Annuler' : 'Nouvelle demande'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Ajouter une demande</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Étudiant</label>
              <select
                required
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Sélectionner</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name || s.name} - {s.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
              <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Nom de l'entreprise" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
              <input required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Intitulé du poste" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Description (optionnel)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700">Enregistrer</button>
        </form>
      )}

      <div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvées</option>
          <option value="rejected">Rejetées</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((r) => {
          const s = r.student || {}
          const statusColors = { pending: 'border-orange-500/50', approved: 'border-emerald-200', rejected: 'border-red-200' }
          return (
            <div key={r.id} className={`bg-white rounded-2xl border shadow-sm ${statusColors[r.status] || 'border-gray-200'} p-6`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-gray-900 font-semibold">{s.full_name || s.name || 'N/A'}</p>
                  <p className="text-gray-600 text-sm">{s.email}</p>
                  <p className="text-gray-500 text-sm mt-1">{r.company} – {r.position}</p>
                  {r.start_date && <p className="text-gray-500 text-xs">{r.start_date} → {r.end_date || '—'}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : r.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                    {r.status === 'pending' ? 'En attente' : r.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                  </span>
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(r.id)} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm">Approuver</button>
                      <button onClick={() => handleReject(r.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Rejeter</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border shadow-sm border-gray-200 p-12 text-center">
          <p className="text-gray-600">Aucune demande de stage</p>
        </div>
      )}
    </div>
  )
}
