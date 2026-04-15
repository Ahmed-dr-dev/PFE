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

      {/* Bottom — Most advanced student card */}
      {ts ? (
        <div className="bg-white rounded-xl border border-amber-200 shadow-md overflow-hidden">
          {/* Header strip */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-5 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400/30 to-orange-400/30 rounded-lg flex items-center justify-center border border-amber-400/40 shrink-0">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider leading-none mb-0.5">Étudiant le plus avancé</p>
              <p className="text-base font-bold text-gray-900 truncate">{ts.full_name ?? 'Inconnu'}</p>
            </div>
            <Link
              href={`/dashboard/professor/suivi/${ts.id}`}
              className="shrink-0 text-xs font-semibold text-amber-700 hover:text-amber-800 border border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-100 transition-colors whitespace-nowrap"
            >
              Voir le suivi →
            </Link>
          </div>

          {/* Body */}
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left — topic + progress */}
            <div className="space-y-3">
              {ts.topicTitle && (
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <p className="text-sm text-gray-600 leading-snug">{ts.topicTitle}</p>
                </div>
              )}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500 font-medium">Documents déposés</span>
                  <span className="font-bold text-gray-700 tabular-nums">{ts.docsUploaded} / {ts.docsTotal}</span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
                    style={{ width: `${docPct}%` }}
                  />
                </div>
                <p className="text-right text-xs text-emerald-600 font-semibold mt-1">{docPct}%</p>
              </div>
            </div>

            {/* Right — validation steps */}
            <div className="flex flex-col justify-center gap-2.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Étapes de validation</p>
              {[
                { active: ts.appValidated, label: 'Application validée', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                { active: ts.rapportValidated, label: 'Rapport validé', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                { active: ts.soutenanceValidated, label: 'Soutenance validée', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
              ].map(({ active, label, icon }) => (
                <div key={label} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${active ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-100'}`}>
                  <svg className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                  <span className={`text-xs font-medium ${active ? 'text-emerald-700' : 'text-gray-400'}`}>{label}</span>
                  {active && (
                    <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-100 rounded-full px-1.5 py-0.5 leading-none">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-md flex items-center justify-center">
          <p className="text-sm text-gray-400 text-center">Aucun étudiant encadré pour le moment.</p>
        </div>
      )}
    </div>
  )
}
