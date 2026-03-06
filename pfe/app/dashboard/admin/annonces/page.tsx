'use client'

import { useState, useEffect } from 'react'

const SETTING_KEYS = [
  { key: 'academic_year', label: 'Année académique', placeholder: '2024-2025' },
  { key: 'topic_submission_deadline', label: 'Date limite soumission sujets', type: 'date' },
  { key: 'internship_request_deadline', label: 'Date limite demandes de stage', type: 'date' },
  { key: 'defense_registration_deadline', label: 'Date limite inscription soutenances', type: 'date' },
]

export default function AnnoncesPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)

  const [announcements, setAnnouncements] = useState<any[]>([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', target_audience: 'all' })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data.settings || {})
        }
      } catch (e) {
        console.error(e)
      } finally {
        setSettingsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/announcements')
        if (res.ok) setAnnouncements((await res.json()).announcements || [])
      } catch (e) {
        console.error(e)
      } finally {
        setAnnouncementsLoading(false)
      }
    }
    load()
  }, [])

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) alert('Paramètres enregistrés')
      else alert((await res.json()).error || 'Erreur')
    } catch (e) {
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSettingsSaving(false)
    }
  }

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

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Annonces</span>
        </h1>
        <p className="text-gray-600 text-lg">Paramètres de la plateforme et annonces</p>
      </div>

      {/* Paramètres */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Paramètres</h2>
        {settingsLoading ? (
          <p className="text-gray-600">Chargement...</p>
        ) : (
          <form onSubmit={handleSettingsSubmit} className="max-w-2xl">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
              {SETTING_KEYS.map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">{label}</label>
                  <input
                    type={type || 'text'}
                    value={settings[key] || ''}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={settingsSaving}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 font-semibold disabled:opacity-50"
              >
                {settingsSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Annonces */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Annonces</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-cyan-700"
          >
            {showForm ? 'Annuler' : 'Nouvelle annonce'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Nouvelle annonce</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Titre de l'annonce"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
              <textarea
                required
                rows={4}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Contenu de l'annonce"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destinataires</label>
              <select value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="all">Tous</option>
                <option value="students">Étudiants uniquement</option>
                <option value="professors">Enseignants uniquement</option>
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700">Publier</button>
          </form>
        )}

        {announcementsLoading ? (
          <p className="text-gray-600">Chargement...</p>
        ) : (
          <>
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-gray-900 font-semibold">{a.title}</p>
                      <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{a.content}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {targetLabels[a.target_audience] || a.target_audience} • {new Date(a.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(a.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 shrink-0">
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {announcements.length === 0 && !showForm && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                <p className="text-gray-600">Aucune annonce</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
