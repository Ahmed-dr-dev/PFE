'use client'

import { useState, useEffect } from 'react'

export default function CommunicationPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', target_audience: 'all' })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/announcements')
        if (res.ok) setAnnouncements((await res.json()).announcements || [])
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
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        setAnnouncements([data.announcement, ...announcements])
        setShowForm(false)
        setForm({ title: '', content: '', target_audience: 'all' })
      } else {
        alert((await res.json()).error)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
      if (res.ok) setAnnouncements(announcements.filter((a) => a.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const targetLabels: Record<string, string> = { all: 'Tous', students: 'Étudiants', professors: 'Enseignants' }

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
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Communication</span>
          </h1>
          <p className="text-gray-400 text-lg">Publier des annonces pour les étudiants et enseignants</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-semibold"
        >
          {showForm ? 'Annuler' : 'Nouvelle annonce'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Nouvelle annonce</h3>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Titre</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
              placeholder="Titre de l'annonce"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Contenu</label>
            <textarea
              required
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white resize-none"
              placeholder="Contenu de l'annonce"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Destinataires</label>
            <select value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white">
              <option value="all">Tous</option>
              <option value="students">Étudiants uniquement</option>
              <option value="professors">Enseignants uniquement</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold">Publier</button>
        </form>
      )}

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <p className="text-white font-semibold">{a.title}</p>
                <p className="text-gray-400 text-sm mt-1 whitespace-pre-wrap">{a.content}</p>
                <p className="text-gray-500 text-xs mt-2">
                  {targetLabels[a.target_audience] || a.target_audience} • {new Date(a.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-sm hover:bg-red-600/30">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {announcements.length === 0 && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-12 text-center">
          <p className="text-gray-400">Aucune annonce</p>
        </div>
      )}
    </div>
  )
}
