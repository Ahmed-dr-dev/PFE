'use client'

import { useState } from 'react'

const DEADLINE_LABELS: Record<string, string> = {
  topic_submission_deadline: 'Date limite soumission des sujets',
  internship_request_deadline: 'Date limite demandes de stage',
  defense_registration_deadline: 'Date limite inscription aux soutenances',
}

function formatDate(value: string) {
  if (!value || !value.trim()) return '—'
  const d = new Date(value.includes('T') ? value : `${value}T12:00:00`)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function LandingFeatures() {
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deadlines, setDeadlines] = useState<
    { key: string; value: string; description: string | null }[]
  >([])

  async function openDeadlines() {
    setModalOpen(true)
    setLoading(true)
    try {
      const res = await fetch('/api/public/deadlines', { cache: 'no-store' })
      const j = await res.json()
      setDeadlines(j.deadlines || [])
    } catch {
      setDeadlines([])
    } finally {
      setLoading(false)
    }
  }

  const items = [
    { icon: '📋', title: 'Sujets', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', calendar: false },
    { icon: '👥', title: 'Encadrement', color: 'bg-blue-100 text-blue-700 border-blue-200', calendar: false },
    { icon: '📊', title: 'Suivi', color: 'bg-purple-100 text-purple-700 border-purple-200', calendar: false },
    { icon: '📅', title: 'Calendrier', color: 'bg-orange-100 text-orange-700 border-orange-200', calendar: true },
  ]

  return (
    <>
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Fonctionnalités</h3>
            <p className="text-gray-600">Tout ce dont vous avez besoin</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <div
                key={index}
                role={item.calendar ? 'button' : undefined}
                tabIndex={item.calendar ? 0 : undefined}
                onClick={item.calendar ? openDeadlines : undefined}
                onKeyDown={
                  item.calendar
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          openDeadlines()
                        }
                      }
                    : undefined
                }
                className={`p-6 bg-gray-50 border border-gray-200 rounded-xl transition-all text-center ${
                  item.calendar
                    ? 'cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2'
                    : 'hover:border-emerald-300'
                }`}
              >
                <div
                  className={`w-16 h-16 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl border`}
                >
                  {item.icon}
                </div>
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                {item.calendar && (
                  <p className="text-xs text-orange-700 mt-2 font-medium">Cliquer pour les dates limites</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deadlines-modal-title"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
              <div>
                <h3 id="deadlines-modal-title" className="text-xl font-bold text-gray-900">
                  Dates limites (PFE)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Paramètres définis par l&apos;administration — connectez-vous pour plus d&apos;annonces.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {loading ? (
                <p className="text-gray-600 text-center py-4">Chargement…</p>
              ) : (
                deadlines.map((d) => (
                  <div
                    key={d.key}
                    className="rounded-xl border border-gray-200 bg-gray-50/80 p-4"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {DEADLINE_LABELS[d.key] || d.key}
                    </p>
                    <p className="text-lg font-bold text-orange-700 mt-1">{formatDate(d.value)}</p>
                    {d.description && (
                      <p className="text-xs text-gray-500 mt-2">{d.description}</p>
                    )}
                  </div>
                ))
              )}
              {!loading && deadlines.every((d) => !d.value?.trim()) && (
                <p className="text-gray-600 text-sm text-center py-2">
                  Aucune date limite renseignée pour le moment.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
