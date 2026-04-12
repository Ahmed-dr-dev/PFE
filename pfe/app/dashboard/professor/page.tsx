'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type TopStudent = {
  id: string
  full_name: string | null
  docsUploaded: number
  docsTotal: number
  appValidated: boolean
  rapportValidated: boolean
  soutenanceValidated: boolean
  topicTitle: string | null
}

type Stats = {
  topicsProposed: number
  studentsSupervised: number
  pendingApplications: number
  topStudent: TopStudent | null
}

function ValidationDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0 ${active ? 'bg-emerald-500' : 'bg-gray-200'}`}
      />
      <span className={`text-xs ${active ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    topicsProposed: 0,
    studentsSupervised: 0,
    pendingApplications: 0,
    topStudent: null,
  })

  useEffect(() => {
    fetch('/api/professor/stats', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setStats((prev) => ({ ...prev, ...data })))
      .catch(() => {})
  }, [])

  const ts = stats.topStudent
  const docPct = ts ? Math.round((ts.docsUploaded / ts.docsTotal) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
            Bienvenue,{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Professeur
            </span>
          </h1>
          <p className="text-gray-600 text-base">Gérez vos sujets et encadrez vos étudiants</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 items-start">
        {/* Card 1 — Topics */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-md flex flex-row sm:flex-col items-center sm:items-center gap-3 sm:gap-0 sm:text-center">
          <div className="shrink-0 sm:mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="min-w-0 flex-1 sm:flex-none text-left sm:text-center">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums leading-tight">{stats.topicsProposed}</p>
            <p className="text-gray-600 text-sm mt-0.5">Sujets proposés</p>
          </div>
        </div>

        {/* Card 2 — Students */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-md flex flex-row sm:flex-col items-center sm:items-center gap-3 sm:gap-0 sm:text-center">
          <div className="shrink-0 sm:mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="min-w-0 flex-1 sm:flex-none text-left sm:text-center">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums leading-tight">{stats.studentsSupervised}</p>
            <p className="text-gray-600 text-sm mt-0.5">Étudiants encadrés</p>
          </div>
        </div>

        {/* Card 3 — Most advanced student */}
        {ts ? (
          <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-lg flex items-center justify-center border border-amber-400/30 shrink-0">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide leading-none mb-0.5">Étudiant le plus avancé</p>
                <p className="text-sm font-bold text-gray-900 truncate">{ts.full_name ?? 'Inconnu'}</p>
              </div>
            </div>

            {ts.topicTitle && (
              <p className="text-xs text-gray-500 truncate leading-snug">{ts.topicTitle}</p>
            )}

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Documents déposés</span>
                <span className="font-semibold text-gray-700 tabular-nums">{ts.docsUploaded} / {ts.docsTotal}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${docPct}%` }}
                />
              </div>
            </div>

            {/* Validation badges */}
            <div className="flex flex-col gap-1">
              <ValidationDot active={ts.appValidated} label="Application validée" />
              <ValidationDot active={ts.rapportValidated} label="Rapport validé" />
              <ValidationDot active={ts.soutenanceValidated} label="Soutenance validée" />
            </div>

            <Link
              href={`/dashboard/professor/suivi/${ts.id}`}
              className="block text-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 border border-emerald-200 rounded-lg py-1.5 hover:bg-emerald-50 transition-colors"
            >
              Voir le suivi →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-md flex items-center justify-center">
            <p className="text-sm text-gray-400 text-center">Aucun étudiant encadré pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
