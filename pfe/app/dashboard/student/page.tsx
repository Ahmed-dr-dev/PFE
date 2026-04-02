'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const SETTING_LABELS: Record<string, string> = {
  academic_year: 'Année académique',
  topic_submission_deadline: 'Date limite — soumission des sujets',
  internship_request_deadline: 'Date limite — demandes de stage',
  defense_registration_deadline: 'Date limite — inscription aux soutenances',
}

const DEADLINE_KEYS = [
  'topic_submission_deadline',
  'internship_request_deadline',
  'defense_registration_deadline',
] as const

function formatSettingDisplay(key: string, value: string): string {
  const v = value?.trim()
  if (!v) return '—'
  if (key.includes('deadline') || key === 'academic_year') {
    const d = new Date(v)
    if (!Number.isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(v)) {
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  }
  return v
}

export default function DashboardPage() {
  const [myPfe, setMyPfe] = useState<any>(null)
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [supervisorFallback, setSupervisorFallback] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [pfeRes, settingsRes, supervisionRes] = await Promise.all([
          fetch('/api/student/my-pfe', { cache: 'no-store' }),
          fetch('/api/student/settings', { cache: 'no-store' }),
          fetch('/api/student/supervision', { cache: 'no-store' }),
        ])
        if (pfeRes.ok) {
          const data = await pfeRes.json()
          setMyPfe(data.pfe)
        }
        if (settingsRes.ok) {
          const data = await settingsRes.json()
          setSettings(data.settings || {})
        }
        if (supervisionRes.ok) {
          const data = await supervisionRes.json()
          setSupervisorFallback(data.supervisor || null)
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const encadrant = myPfe?.supervisor || supervisorFallback

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-purple-500/20 text-purple-200 border-purple-500/50',
  }

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    in_progress: 'En cours',
    completed: 'Terminé',
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="relative bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-2xl">
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  const deadlinesBlock = (
    <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-xl">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        Dates limites (administration)
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Définies par l&apos;administration — voir aussi{' '}
        <Link href="/dashboard/student/annonces" className="text-emerald-600 font-semibold hover:underline">
          Annonces
        </Link>
        .
      </p>
      <ul className="space-y-3 text-sm">
        {settings.academic_year ? (
          <li className="flex flex-col gap-0.5">
            <span className="text-gray-500 font-medium">{SETTING_LABELS.academic_year}</span>
            <span className="text-gray-900 font-semibold">{formatSettingDisplay('academic_year', settings.academic_year)}</span>
          </li>
        ) : null}
        {DEADLINE_KEYS.map((key) => (
          <li key={key} className="flex flex-col gap-0.5">
            <span className="text-gray-500 font-medium">{SETTING_LABELS[key] || key}</span>
            <span className="text-gray-900 font-semibold">{formatSettingDisplay(key, settings[key] || '')}</span>
          </li>
        ))}
      </ul>
      {!settings.academic_year && DEADLINE_KEYS.every((k) => !settings[k]?.trim()) && (
        <p className="text-gray-500 text-sm mt-2">Aucune date publiée pour le moment.</p>
      )}
    </div>
  )

  const encadrantBlock = encadrant ? (
    <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-xl">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        Encadrant
      </h3>
      <div className="space-y-3">
        <p className="text-gray-900 font-semibold">{encadrant.full_name}</p>
        {encadrant.email && (
          <a href={`mailto:${encadrant.email}`} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors block">
            {encadrant.email}
          </a>
        )}
        {encadrant.office && <p className="text-gray-600 text-sm">Bureau : {encadrant.office}</p>}
      </div>
      <Link href="/dashboard/student/supervision" className="inline-block mt-4 text-sm font-semibold text-emerald-600 hover:underline">
        Mon encadrement →
      </Link>
    </div>
  ) : null

  if (!myPfe) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
              Bienvenue, <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Étudiant</span>
            </h1>
            <p className="text-gray-600 text-lg">Gérez votre Projet de Fin d&apos;Études</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex items-center">
            <div className="relative bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-2xl overflow-hidden w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5" />
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                  <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun sujet PFE assigné</h3>
                <p className="text-gray-600 mb-4 text-lg max-w-xl mx-auto">
                  L&apos;administrateur doit approuver votre affectation et un sujet doit vous être assigné pour afficher le détail du PFE ici. Les dates limites fixées par l&apos;administration sont indiquées à droite.
                </p>
                <p className="text-gray-500 text-sm">
                  {encadrant ? 'Votre encadrant est indiqué ci-contre — contactez-le si besoin.' : 'Un encadrant doit vous ajouter à sa supervision pour commencer.'}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {deadlinesBlock}
            {encadrantBlock}
            <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-2">
                <Link href="/dashboard/student/topics" className="block px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 transition-all">
                  Sujets disponibles
                </Link>
                <Link href="/dashboard/student/supervision" className="block px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 transition-all">
                  Mon encadrement
                </Link>
                <Link href="/dashboard/student/suivi-mon-pfe" className="block px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 transition-all">
                  Suivi — Mon PFE
                </Link>
                <Link href="/dashboard/student/annonces" className="block px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 transition-all">
                  Annonces & paramètres
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Bienvenue, <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Étudiant</span>
          </h1>
          <p className="text-gray-600 text-lg">Gérez votre Projet de Fin d'Études</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-2xl overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Votre PFE actuel</h2>
                <span
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border backdrop-blur-sm ${
                    statusColors[myPfe.status] || statusColors.pending
                  }`}
                >
                  {statusLabels[myPfe.status] || 'Inconnu'}
                </span>
              </div>
              
              <div className="flex-1 space-y-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sujet</p>
                  <p className="text-gray-900 font-bold text-2xl">{myPfe.topic?.title || 'N/A'}</p>
                </div>
                
                {myPfe.topic?.description && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                    <p className="text-gray-700 leading-relaxed text-lg">{myPfe.topic.description}</p>
                  </div>
                )}

                {myPfe.progress !== undefined && myPfe.progress !== null && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progression</p>
                      <span className="text-sm font-semibold text-gray-900">{myPfe.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${myPfe.progress || 0}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6">
                  <Link
                    href="/dashboard/student/suivi-mon-pfe"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5"
                  >
                    Suivi &amp; documents
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {deadlinesBlock}
          {encadrantBlock}

          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              Actions rapides
            </h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/student/topics"
                className="block px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 transition-all"
              >
                Sujets disponibles
              </Link>
              <Link
                href="/dashboard/student/supervision"
                className="block px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 transition-all"
              >
                Mon encadrement
              </Link>
              <Link
                href="/dashboard/student/suivi-mon-pfe"
                className="block px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 transition-all"
              >
                Suivi — Mon PFE
              </Link>
              <Link
                href="/dashboard/student/annonces"
                className="block px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 transition-all"
              >
                Annonces & paramètres
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
