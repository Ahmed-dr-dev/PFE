'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CreateUserModal } from '../components/CreateUserModal'
import { EditUserModal } from '../components/EditUserModal'

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<any | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  useEffect(() => {
    fetchStudents()
  }, [])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer le compte de ${name} ? Cette action est irréversible.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      await fetchStudents()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Impossible de supprimer')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Gestion des <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">étudiants</span>
          </h1>
          <p className="text-gray-600 text-lg">Gérez la liste des étudiants et leurs informations</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 font-semibold text-sm transition-all shrink-0"
        >
          Créer un compte
        </button>
      </div>
      <CreateUserModal role="student" open={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={fetchStudents} />
      <EditUserModal role="student" user={editUser} open={!!editUser} onClose={() => setEditUser(null)} onSuccess={fetchStudents} />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Statut
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200 transition-colors"
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
            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200 transition-colors"
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

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {filteredStudents && filteredStudents.length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {filteredStudents.map((student: any) => (
              <div
                key={student.id}
                className="flex flex-wrap items-center gap-3 px-4 py-2.5 hover:bg-gray-200/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-gray-900 font-semibold text-xs shrink-0">
                  {(student.full_name || student.name || 'N/A').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm truncate">{student.full_name || student.name || 'N/A'}</span>
                    {student.pfeStatus && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColors[student.pfeStatus] || statusColors.pending}`}>
                        {statusLabels[student.pfeStatus] || 'En attente'}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-xs truncate">{student.email}</p>
                </div>
                <div className="text-gray-600 text-xs shrink-0">
                  {student.department && <span>{student.department}</span>}
                  {student.department && student.year && ' · '}
                  {student.year && <span>{student.year}</span>}
                  {student.supervisor && (
                    <span className="hidden sm:inline"> · {typeof student.supervisor === 'object' ? student.supervisor?.full_name : student.supervisor}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link href={`/dashboard/admin/students/${student.id}`} className="px-2.5 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700">
                    Profil
                  </Link>
                  <button type="button" onClick={() => setEditUser(student)} className="px-2.5 py-1.5 bg-amber-500 text-white rounded text-xs font-medium hover:bg-amber-600">
                    Modifier
                  </button>
                  <button type="button" onClick={() => handleDelete(student.id, student.full_name || student.name || '')} disabled={deletingId === student.id} className="px-2.5 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50">
                    {deletingId === student.id ? '…' : 'Supprimer'}
                  </button>
                  {!student.hasPfe && (
                    <Link href={`/dashboard/admin/assignments?student=${student.id}`} className="px-2.5 py-1.5 bg-cyan-600 text-white rounded text-xs font-medium hover:bg-cyan-700">
                      Affecter
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-600 text-sm">Aucun étudiant trouvé</p>
          </div>
        )}
      </div>
      </div>
    
  )
}


