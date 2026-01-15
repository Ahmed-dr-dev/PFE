'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AssignmentsPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const res = await fetch('/api/admin/assignments')
        if (res.ok) {
          const data = await res.json()
          setAssignments(data.assignments || [])
        }
      } catch (error) {
        console.error('Error fetching assignments:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAssignments()
  }, [])
   
 

  const handleAssign = async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/admin/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      if (res.ok) {
        router.refresh()
        setAssignments(assignments.map(a => a.id === assignmentId ? { ...a, status: 'approved' } : a))
      }
    } catch (error) {
      console.error('Error updating assignment:', error)
    }
  }

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
  const existingDepartments = Array.from(new Set(assignments.map((a: any) => a.student?.department).filter(Boolean)))
  const departments = Array.from(new Set([...existingDepartments, ...allDepartments]))

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment: any) => {
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter
    const matchesDepartment = departmentFilter === 'all' || assignment.student?.department === departmentFilter
    return matchesStatus && matchesDepartment
  })

  const pendingAssignments = filteredAssignments.filter((a: any) => a.status === 'pending')
  const assigned = filteredAssignments.filter((a: any) => a.status === 'approved')
  const rejected = filteredAssignments.filter((a: any) => a.status === 'rejected')

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Affectations</span>
          </h1>
          <p className="text-gray-400 text-lg">Affectez les encadrants aux étudiants</p>
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
            <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
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

      {pendingAssignments.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">En attente d'affectation ({pendingAssignments.length})</h2>
          <div className="grid grid-cols-1 gap-6">
            {pendingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-6 shadow-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Étudiant</h3>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                        {(assignment.student?.full_name || assignment.student?.name || 'N/A').split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{assignment.student?.full_name || assignment.student?.name || 'N/A'}</p>
                        <p className="text-gray-400 text-sm">{assignment.student?.email || 'N/A'}</p>
                        <p className="text-gray-500 text-xs mt-1">{assignment.student?.department || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Sujet & Encadrant</h3>
                    <div>
                      <p className="text-white font-semibold mb-1">{assignment.topic?.title || 'N/A'}</p>
                      <p className="text-gray-400 text-sm">{assignment.topic?.professor?.full_name || assignment.supervisor?.full_name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                  <button
                    onClick={() => handleAssign(assignment.id)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25"
                  >
                    Confirmer l'affectation
                  </button>
                  <Link
                    href={`/dashboard/admin/assignments/${assignment.id}`}
                    className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold text-sm"
                  >
                    Modifier
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {assigned.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Affectations confirmées ({assigned.length})</h2>
          <div className="grid grid-cols-1 gap-6">
            {assigned.map((assignment) => (
              <div
                key={assignment.id}
                className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Étudiant</h3>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                        {(assignment.student?.full_name || assignment.student?.name || 'N/A').split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{assignment.student?.full_name || assignment.student?.name || 'N/A'}</p>
                        <p className="text-gray-400 text-sm">{assignment.student?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Sujet & Encadrant</h3>
                    <div>
                      <p className="text-white font-semibold mb-1">{assignment.topic?.title || 'N/A'}</p>
                      <p className="text-gray-400 text-sm">{assignment.topic?.professor?.full_name || assignment.supervisor?.full_name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rejected.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Affectations rejetées ({rejected.length})</h2>
          <div className="grid grid-cols-1 gap-6">
            {rejected.map((assignment) => (
              <div
                key={assignment.id}
                className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6 shadow-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Étudiant</h3>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                        {(assignment.student?.full_name || assignment.student?.name || 'N/A').split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{assignment.student?.full_name || assignment.student?.name || 'N/A'}</p>
                        <p className="text-gray-400 text-sm">{assignment.student?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Sujet & Encadrant</h3>
                    <div>
                      <p className="text-white font-semibold mb-1">{assignment.topic?.title || 'N/A'}</p>
                      <p className="text-gray-400 text-sm">{assignment.topic?.professor?.full_name || assignment.supervisor?.full_name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingAssignments.length === 0 && assigned.length === 0 && rejected.length === 0 && (
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 shadow-xl text-center">
          <p className="text-gray-400 text-lg">Aucune affectation trouvée</p>
        </div>
      )}
    </div>
  )
}


