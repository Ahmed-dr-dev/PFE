'use client'

import { useState, useEffect } from 'react'

const SETTING_LABELS: Record<string, string> = {
  academic_year: 'Année académique',
  topic_submission_deadline: 'Date limite soumission sujets',
  internship_request_deadline: 'Date limite demandes de stage',
  defense_registration_deadline: 'Date limite inscription soutenances',
}

export default function StudentSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/student/settings')
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
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Paramètres</span>
        </h1>
        <p className="text-gray-400 text-lg">Consultation des paramètres de la plateforme</p>
      </div>

      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 space-y-6 max-w-2xl">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-400 mb-2">{SETTING_LABELS[key] || key}</label>
            <p className="text-white font-medium">{value || '—'}</p>
          </div>
        ))}
        {Object.keys(settings).length === 0 && (
          <p className="text-gray-400">Aucun paramètre disponible</p>
        )}
      </div>
    </div>
  )
}
