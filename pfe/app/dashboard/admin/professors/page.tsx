'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchProfessors() {
      try {
        const res = await fetch('/api/admin/professors')
        if (res.ok) {
          const data = await res.json()
          setProfessors(data.professors || [])
        }
      } catch (error) {
        console.error('Error fetching professors:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfessors()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  // Get unique departments
  const allDepartments = ['informatique', 'gestion', 'finance', 'marketing', 'rh', 'comptabilite']
  const existingDepartments = Array.from(new Set(professors.map((p: any) => p.department).filter(Boolean)))
  const departments = Array.from(new Set([...existingDepartments, ...allDepartments]))

  // Filter professors
  const filteredProfessors = professors.filter((professor: any) => {
    const matchesDepartment = departmentFilter === 'all' || professor.department === departmentFilter
    return matchesDepartment
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Gestion des <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">enseignants</span>
          </h1>
          <p className="text-gray-400 text-lg">Gérez la liste des enseignants et leurs informations</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Département
          </label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="all">Tous les départements</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept.charAt(0).toUpperCase() + dept.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredProfessors && filteredProfessors.length > 0 ? filteredProfessors.map((professor: any) => (
          <div
            key={professor.id}
            className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl hover:border-emerald-500/50 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                  {(professor.full_name || professor.name || 'N/A').split(' ').slice(1).map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{professor.full_name || professor.name || 'N/A'}</h3>
                  <p className="text-gray-400 text-sm mb-3">{professor.email}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{professor.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{professor.topicsCount} sujets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{professor.studentsCount} étudiants</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/admin/professors/${professor.id}`}
                  className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold text-sm"
                >
                  Voir profil
                </Link>
              </div>
            </div>
          </div>
        )) : (
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-xl">
            <p className="text-gray-400 text-lg">Aucun enseignant trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}


