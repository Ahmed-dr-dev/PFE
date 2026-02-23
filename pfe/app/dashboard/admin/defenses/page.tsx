'use client'

import { useState, useEffect } from 'react'

export default function DefensesPage() {
  const [defenses, setDefenses] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ pfe_project_id: '', scheduled_date: '', scheduled_time: '', room: '', jury_members: '', notes: '' })

  useEffect(() => {
    async function load() {
      try {
        const [defRes, assignRes] = await Promise.all([
          fetch('/api/admin/defenses'),
          fetch('/api/admin/assignments'),
        ])
        if (defRes.ok) setDefenses((await defRes.json()).defenses || [])
        if (assignRes.ok) {
          const asg = (await assignRes.json()).assignments || []
          setProjects(asg.filter((a: { status: string }) => a.status === 'approved' || a.status === 'in_progress'))
        }
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
      const jury = form.jury_members ? form.jury_members.split(',').map((s) => s.trim()).filter(Boolean) : []
      const res = await fetch('/api/admin/defenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pfe_project_id: form.pfe_project_id,
          scheduled_date: form.scheduled_date,
          scheduled_time: form.scheduled_time || null,
          room: form.room || null,
          jury_members: jury,
          notes: form.notes || null,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setDefenses([...defenses, data.defense])
        setShowForm(false)
        setForm({ pfe_project_id: '', scheduled_date: '', scheduled_time: '', room: '', jury_members: '', notes: '' })
      } else {
        alert((await res.json()).error)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/defenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) setDefenses(defenses.map((d) => (d.id === id ? { ...d, status } : d)))
    } catch (e) {
      console.error(e)
    }
  }

  const scheduledIds = new Set(defenses.map((d) => d.pfe_project_id))
  const availableProjects = projects.filter((p) => !scheduledIds.has(p.id))

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
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Soutenances</span>
          </h1>
          <p className="text-gray-400 text-lg">Gérer les soutenances de PFE</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={availableProjects.length === 0}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {showForm ? 'Annuler' : 'Planifier une soutenance'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Nouvelle soutenance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Projet PFE</label>
              <select
                required
                value={form.pfe_project_id}
                onChange={(e) => setForm({ ...form, pfe_project_id: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
              >
                <option value="">Sélectionner</option>
                {availableProjects.map((p) => {
                  const s = p.student || {}
                  const t = p.topic || {}
                  return (
                    <option key={p.id} value={p.id}>
                      {s.full_name || s.name} – {t.title || 'Sans sujet'}
                    </option>
                  )
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <input required type="date" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Heure</label>
              <input type="time" value={form.scheduled_time} onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Salle</label>
              <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" placeholder="Ex: Amphi A" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Membres du jury (séparés par des virgules)</label>
              <input value={form.jury_members} onChange={(e) => setForm({ ...form, jury_members: e.target.value })} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" placeholder="Pr. X, Dr. Y, ..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold">Planifier</button>
        </form>
      )}

      <div className="space-y-4">
        {defenses
          .sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || ''))
          .map((d) => {
            const pp = d.pfe_projects
            const student = pp?.student || {}
            const topic = pp?.topic || {}
            const statusColors = { scheduled: 'border-emerald-500/50', completed: 'border-slate-600', cancelled: 'border-red-500/50', postponed: 'border-orange-500/50' }
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
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      d.status === 'scheduled' ? 'bg-emerald-500/20 text-emerald-400' :
                      d.status === 'completed' ? 'bg-slate-500/20 text-gray-400' :
                      d.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {d.status === 'scheduled' ? 'Planifiée' : d.status === 'completed' ? 'Terminée' : d.status === 'cancelled' ? 'Annulée' : 'Reportée'}
                    </span>
                    {d.status === 'scheduled' && (
                      <>
                        <button onClick={() => handleStatusChange(d.id, 'completed')} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm">Terminer</button>
                        <button onClick={() => handleStatusChange(d.id, 'postponed')} className="px-3 py-1 bg-orange-600 text-white rounded text-sm">Reporter</button>
                        <button onClick={() => handleStatusChange(d.id, 'cancelled')} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Annuler</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {defenses.length === 0 && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-12 text-center">
          <p className="text-gray-400">Aucune soutenance planifiée</p>
        </div>
      )}
    </div>
  )
}
