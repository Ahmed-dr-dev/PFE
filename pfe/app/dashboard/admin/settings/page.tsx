'use client'

import { useState, useEffect } from 'react'

const SETTING_KEYS = [
  { key: 'academic_year', label: 'Année académique', placeholder: '2024-2025' },
  { key: 'topic_submission_deadline', label: 'Date limite soumission sujets', type: 'date' },
  { key: 'internship_request_deadline', label: 'Date limite demandes de stage', type: 'date' },
  { key: 'defense_registration_deadline', label: 'Date limite inscription soutenances', type: 'date' },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
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
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Gestion des paramètres</span>
        </h1>
        <p className="text-gray-400 text-lg">Configurer les paramètres de la plateforme</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 space-y-6">
          {SETTING_KEYS.map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-400 mb-2">{label}</label>
              <input
                type={type || 'text'}
                value={settings[key] || ''}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 font-semibold disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}
