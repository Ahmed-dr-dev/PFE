'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CreateUserModal } from '../components/CreateUserModal'
import { EditUserModal } from '../components/EditUserModal'

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<any | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  useEffect(() => {
    fetchProfessors()
  }, [])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer le compte de ${name} ? Cette action est irréversible.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      await fetchProfessors()
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
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Gestion des <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">enseignants</span>
          </h1>
          <p className="text-gray-600 text-lg">Gérez la liste des enseignants et leurs informations</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 font-semibold text-sm transition-all shrink-0"
        >
          Créer un compte
        </button>
      </div>
      <CreateUserModal role="professor" open={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={fetchProfessors} />
      <EditUserModal role="professor" user={editUser} open={!!editUser} onClose={() => setEditUser(null)} onSuccess={fetchProfessors} />

      <div className="flex flex-col sm:flex-row gap-4">
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
        {filteredProfessors && filteredProfessors.length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {filteredProfessors.map((professor: any) => (
              <div
                key={professor.id}
                className="flex flex-wrap items-center gap-3 px-4 py-2.5 hover:bg-gray-200/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-gray-900 font-semibold text-xs shrink-0">
                  {(professor.full_name || professor.name || 'N/A').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">{professor.full_name || professor.name || 'N/A'}</p>
                  <p className="text-gray-600 text-xs truncate">{professor.email}</p>
                </div>
                <div className="text-gray-600 text-xs shrink-0">
                  {professor.department && <span>{professor.department}</span>}
                  <span className="text-slate-500"> · {professor.topicsCount} sujets · {professor.studentsCount} étudiants</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link href={`/dashboard/admin/professors/${professor.id}`} className="px-2.5 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700">
                    Profil
                  </Link>
                  <button type="button" onClick={() => setEditUser(professor)} className="px-2.5 py-1.5 bg-amber-500 text-white rounded text-xs font-medium hover:bg-amber-600">
                    Modifier
                  </button>
                  <button type="button" onClick={() => handleDelete(professor.id, professor.full_name || professor.name || '')} disabled={deletingId === professor.id} className="px-2.5 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50">
                    {deletingId === professor.id ? '…' : 'Supprimer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-600 text-sm">Aucun enseignant trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}


