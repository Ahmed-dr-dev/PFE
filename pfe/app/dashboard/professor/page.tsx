'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type RankedStudent = {
  id: string
  full_name: string | null
  docsUploaded: number
  docsTotal: number
  appValidated: boolean
  rapportValidated: boolean
  soutenanceValidated: boolean
  topicTitle: string | null
  score: number
}

type Stats = {
  topicsProposed: number
  studentsSupervised: number
  pendingApplications: number
  rankedStudents: RankedStudent[]
}

const RANK_COLORS = [
  { border: 'border-amber-300', bg: 'bg-amber-50', badge: 'bg-amber-400 text-white', bar: 'from-amber-400 to-orange-400' },
  { border: 'border-gray-300', bg: 'bg-gray-50', badge: 'bg-gray-400 text-white', bar: 'from-gray-400 to-gray-500' },
  { border: 'border-orange-300', bg: 'bg-orange-50', badge: 'bg-orange-400 text-white', bar: 'from-orange-400 to-red-400' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    topicsProposed: 0,
    studentsSupervised: 0,
    pendingApplications: 0,
    rankedStudents: [],
  })

  useEffect(() => {
    fetch('/api/professor/stats', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setStats((prev) => ({ ...prev, ...data })))
      .catch(() => {})
  }, [])

  const { rankedStudents } = stats

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

      {/* Top row — 2 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {/* Card 1 — Topics */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-md flex items-center gap-4">
          <div className="shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 tabular-nums leading-tight">{stats.topicsProposed}</p>
            <p className="text-gray-500 text-sm mt-0.5">Sujets proposés</p>
          </div>
        </div>

        {/* Card 2 — Students */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-md flex items-center gap-4">
          <div className="shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 tabular-nums leading-tight">{stats.studentsSupervised}</p>
            <p className="text-gray-500 text-sm mt-0.5">Étudiants encadrés</p>
          </div>
        </div>
      </div>

      {/* Ranked student list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-5 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400/30 to-orange-400/30 rounded-lg flex items-center justify-center border border-amber-400/40 shrink-0">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-amber-700">Classement des étudiants — du plus avancé au moins avancé</p>
        </div>

        {rankedStudents.length === 0 ? (
          <div className="px-5 py-10 flex items-center justify-center">
            <p className="text-sm text-gray-400">Aucun étudiant encadré pour le moment.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {rankedStudents.map((s, idx) => {
              const pct = Math.round((s.docsUploaded / s.docsTotal) * 100)
              const colors = RANK_COLORS[idx] ?? { border: 'border-gray-100', bg: 'bg-white', badge: 'bg-gray-200 text-gray-600', bar: 'from-emerald-400 to-cyan-400' }
              return (
                <li key={s.id} className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 ${idx === 0 ? colors.bg : ''}`}>
                  {/* Rank badge */}
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${colors.badge}`}>
                    {idx + 1}
                  </div>

                  {/* Name + topic */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {s.full_name ?? 'Inconnu'}
                      {idx === 0 && (
                        <span className="ml-2 text-xs font-semibold text-amber-600 bg-amber-100 rounded-full px-2 py-0.5">le plus avancé</span>
                      )}
                    </p>
                    {s.topicTitle && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{s.topicTitle}</p>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="sm:w-40 shrink-0 space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Docs</span>
                      <span className="font-semibold tabular-nums text-gray-700">{s.docsUploaded}/{s.docsTotal}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-right text-xs font-semibold text-gray-500">{pct}%</p>
                  </div>

                  {/* Validation dots */}
                  <div className="flex items-center gap-2 shrink-0">
                    {[
                      { active: s.appValidated, title: 'Application' },
                      { active: s.rapportValidated, title: 'Rapport' },
                      { active: s.soutenanceValidated, title: 'Soutenance' },
                    ].map(({ active, title }) => (
                      <div key={title} className="flex flex-col items-center gap-0.5" title={title}>
                        <span className={`w-3 h-3 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                        <span className="text-[10px] text-gray-400 leading-none">{title.slice(0, 3)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Link */}
                  <Link
                    href={`/dashboard/professor/suivi/${s.id}`}
                    className="shrink-0 text-xs font-semibold text-emerald-700 hover:text-emerald-800 border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-50 transition-colors whitespace-nowrap"
                  >
                    Voir →
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
