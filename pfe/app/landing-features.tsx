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

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Gestion des sujets',
    desc: 'Proposez, soumettez et validez les sujets de PFE en ligne.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    calendar: false,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Encadrement',
    desc: 'Mise en relation directe entre étudiants et enseignants encadrants.',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    calendar: false,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Suivi en temps réel',
    desc: 'Tableau de bord complet, réunions, documents et notifications.',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    calendar: false,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Calendrier & Dates',
    desc: 'Consultez les dates limites officielles définies par l\'administration.',
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    calendar: true,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'Soutenances',
    desc: 'Planification des jurys, dates et salles de soutenance en quelques clics.',
    color: 'bg-rose-50 text-rose-600 border-rose-200',
    calendar: false,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: 'Notifications',
    desc: 'Alertes en temps réel pour toutes les actions importantes de la plateforme.',
    color: 'bg-teal-50 text-teal-600 border-teal-200',
    calendar: false,
  },
]

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

  return (
    <>
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3">Fonctionnalités</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Une suite complète d&apos;outils pour gérer chaque étape du projet de fin d&apos;études.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                role={f.calendar ? 'button' : undefined}
                tabIndex={f.calendar ? 0 : undefined}
                onClick={f.calendar ? openDeadlines : undefined}
                onKeyDown={
                  f.calendar
                    ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDeadlines() } }
                    : undefined
                }
                className={`group p-6 rounded-2xl border bg-white transition-all ${
                  f.calendar
                    ? 'cursor-pointer hover:shadow-md hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2'
                    : 'hover:shadow-md hover:border-gray-300'
                } border-gray-200`}
              >
                <div className={`w-12 h-12 rounded-xl border ${f.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                  {f.icon}
                </div>
                <h4 className="font-bold text-gray-900 mb-1.5">{f.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                {f.calendar && (
                  <p className="text-xs font-semibold text-orange-600 mt-3 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Voir les dates limites
                  </p>
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
            <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
              <div>
                <h3 id="deadlines-modal-title" className="text-xl font-bold text-gray-900">
                  Dates limites — PFE
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Paramètres définis par l&apos;administration.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-3">
              {loading ? (
                <p className="text-gray-500 text-center py-6 text-sm">Chargement…</p>
              ) : (
                deadlines.map((d) => (
                  <div key={d.key} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      {DEADLINE_LABELS[d.key] || d.key}
                    </p>
                    <p className="text-base font-bold text-orange-600">{formatDate(d.value)}</p>
                    {d.description && (
                      <p className="text-xs text-gray-400 mt-1.5">{d.description}</p>
                    )}
                  </div>
                ))
              )}
              {!loading && deadlines.every((d) => !d.value?.trim()) && (
                <p className="text-gray-500 text-sm text-center py-4">
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
