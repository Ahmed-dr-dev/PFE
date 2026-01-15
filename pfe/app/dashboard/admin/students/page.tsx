'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch('/api/admin/students')
        if (res.ok) {
          const data = await res.json()
          setStudents(data.students || [])
        }
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
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

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50',
    in_progress: 'bg-blue-500/20 text-blue-200 border-blue-500/50',
    completed: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50',
  }

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    in_progress: 'En cours',
    completed: 'Terminé',
  }

  // Get unique departments
  const allDepartments = ['informatique', 'gestion', 'finance', 'marketing', 'rh', 'comptabilite']
  const existingDepartments = Array.from(new Set(students.map((s: any) => s.department).filter(Boolean)))
  const departments = Array.from(new Set([...existingDepartments, ...allDepartments]))

  // Filter students
  const filteredStudents = students.filter((student: any) => {
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && !student.hasPfe) ||
      (statusFilter !== 'pending' && student.pfeStatus === statusFilter)
    const matchesDepartment = departmentFilter === 'all' || student.department === departmentFilter
    return matchesStatus && matchesDepartment
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Gestion des <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">étudiants</span>
          </h1>
          <p className="text-gray-400 text-lg">Gérez la liste des étudiants et leurs informations</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Statut
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">Sans PFE</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
            <option value="approved">Approuvé</option>
          </select>
        </div>
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
        {filteredStudents && filteredStudents.length > 0 ? filteredStudents.map((student: any) => (
          <div
            key={student.id}
            className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl hover:border-emerald-500/50 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                  {(student.full_name || student.name || 'N/A').split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-white">{student.full_name || student.name || 'N/A'}</h3>
                    {student.pfeStatus && (
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border backdrop-blur-sm ${
                          statusColors[student.pfeStatus] || statusColors.pending
                        }`}
                      >
                        {statusLabels[student.pfeStatus] || 'En attente'}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{student.email}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{student.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{student.year}</span>
                    </div>
                    {student.supervisor && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{student.supervisor.full_name || student.supervisor || 'N/A'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/admin/students/${student.id}`}
                  className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold text-sm"
                >
                  Voir profil
                </Link>
                {!student.hasPfe && (
                  <Link
                    href={`/dashboard/admin/assignments?student=${student.id}`}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/50 text-emerald-200 rounded-lg hover:from-emerald-600/30 hover:to-cyan-600/30 transition-all duration-200 font-semibold text-sm"
                  >
                    Affecter
                  </Link>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-xl">
            <p className="text-gray-400 text-lg">Aucun étudiant trouvé</p>
          </div>
        )}
      </div>
      </div>
    
  )
}


