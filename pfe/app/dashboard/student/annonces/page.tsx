'use client'

import { useState, useEffect } from 'react'

const SETTING_LABELS: Record<string, string> = {
  academic_year: 'Année académique',
  topic_submission_deadline: 'Date limite soumission sujets',
  internship_request_deadline: 'Date limite demandes de stage',
  defense_registration_deadline: 'Date limite inscription soutenances',
}

export default function StudentAnnoncesPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(true)

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
        setSettingsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/announcements')
        if (res.ok) setAnnouncements((await res.json()).announcements || [])
      } catch (e) {
        console.error(e)
      } finally {
        setAnnouncementsLoading(false)
      }
    }
    load()
  }, [])

  const targetLabels: Record<string, string> = { all: 'Tous', students: 'Étudiants', professors: 'Enseignants' }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Annonces</span>
        </h1>
        <p className="text-gray-600 text-lg">Paramètres de la plateforme et annonces</p>
      </div>

      {/* Paramètres (read-only) */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Paramètres</h2>
        {settingsLoading ? (
          <p className="text-gray-600">Chargement...</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6 max-w-2xl">
            {Object.entries(settings).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{SETTING_LABELS[key] || key}</label>
                <p className="text-gray-900 font-medium">{value || '—'}</p>
              </div>
            ))}
            {Object.keys(settings).length === 0 && <p className="text-gray-600">Aucun paramètre disponible</p>}
          </div>
        )}
      </section>

      {/* Annonces */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Annonces</h2>
        {announcementsLoading ? (
          <p className="text-gray-600">Chargement...</p>
        ) : (
          <>
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <p className="text-gray-900 font-semibold">{a.title}</p>
                  <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{a.content}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    {targetLabels[a.target_audience] || a.target_audience} • {new Date(a.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
            {announcements.length === 0 && (
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
