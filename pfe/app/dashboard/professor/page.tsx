'use client'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [stats, setStats] = useState({ topicsProposed: 0, studentsSupervised: 0, pendingApplications: 0 })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/professor/stats', {
          cache: 'no-store',
        })
        if (!res.ok) return
        const data = await res.json()
        setStats(data)
      } catch (error) {
        // Handle error
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
            Bienvenue, <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Professeur</span>
          </h1>
          <p className="text-gray-600 text-base">Gérez vos sujets et encadrez vos étudiants</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 items-start">
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

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-md flex flex-row sm:flex-col items-center sm:items-center gap-3 sm:gap-0 sm:text-center">
          <div className="shrink-0 sm:mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="min-w-0 flex-1 sm:flex-none text-left sm:text-center">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums leading-tight">{stats.studentsSupervised}</p>
            <p className="text-gray-600 text-sm mt-0.5">Étudiants encadrés</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-md flex flex-row sm:flex-col items-center sm:items-center gap-3 sm:gap-0 sm:text-center">
          <div className="shrink-0 sm:mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="min-w-0 flex-1 sm:flex-none text-left sm:text-center">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums leading-tight">{stats.pendingApplications}</p>
            <p className="text-gray-600 text-sm mt-0.5">Demandes en attente</p>
          </div>
        </div>
      </div>
    </div>
  )
}


