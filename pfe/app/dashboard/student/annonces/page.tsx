'use client'

import { useState, useEffect } from 'react'

const SETTING_LABELS: Record<string, string> = {
  academic_year: 'Année académique',
  topic_submission_deadline: 'Date limite soumission sujets',
  internship_request_deadline: 'Date limite demandes de stage',
  defense_registration_deadline: 'Date limite inscription soutenances',
  defense_period_start: 'Début de la période des soutenances',
  defense_period_end: 'Fin de la période des soutenances',
}

export default function StudentAnnoncesPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(true)
  const [planningPdfLoading, setPlanningPdfLoading] = useState(false)

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

  async function handleDownloadPlanningPdf() {
    setPlanningPdfLoading(true)
    try {
      const res = await fetch('/api/student/defenses-planning-export', { cache: 'no-store' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        window.alert(j.error || `Erreur ${res.status}`)
        return
      }
      const data = await res.json()
      const defenses = data.defenses || []
      const { downloadDefensesPlanningPdf } = await import('@/lib/defenses-planning-pdf')
      await downloadDefensesPlanningPdf(defenses)
    } catch (e) {
      console.error(e)
      window.alert('Impossible de générer le PDF.')
    } finally {
      setPlanningPdfLoading(false)
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

      {/* Planning PDF — généré localement dans le navigateur, aucun fichier sur Supabase */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Planning des soutenances</h2>
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 max-w-2xl">
          <p className="text-gray-700 text-sm mb-4">
            Téléchargez le planning officiel au format PDF sur votre ordinateur. Le document est créé dans votre navigateur (téléchargement local) ; aucun fichier n’est enregistré sur le serveur.
          </p>
          <button
            type="button"
            disabled={planningPdfLoading}
            onClick={() => void handleDownloadPlanningPdf()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50"
          >
            {planningPdfLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Génération…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Télécharger le planning (PDF)
              </>
            )}
          </button>
        </div>
      </section>

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
