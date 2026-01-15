'use client'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    pendingTopics: 0,
    totalStudents: 0,
    totalProfessors: 0,
    activePFE: 0,
    pendingAssignments: 0,
    completedPFE: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Bienvenue, <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Administration</span>
          </h1>
          <p className="text-gray-400 text-lg">Gérez les étudiants, enseignants et sujets de PFE</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-xl flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-5xl font-bold text-white mb-2">{stats.totalStudents}</p>
          <p className="text-gray-400 text-lg">Étudiants</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-xl flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-5xl font-bold text-white mb-2">{stats.totalProfessors}</p>
          <p className="text-gray-400 text-lg">Enseignants</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-xl flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-5xl font-bold text-white mb-2">{stats.activePFE}</p>
          <p className="text-gray-400 text-lg">PFE actifs</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-xl flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center border border-orange-500/30">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-5xl font-bold text-white mb-2">{stats.pendingAssignments}</p>
          <p className="text-gray-400 text-lg">Affectations en attente</p>
        </div>
      </div>
    </div>
  )
}


