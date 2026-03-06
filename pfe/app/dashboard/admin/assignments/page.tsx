'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

async function fetchAssignments() {
  const res = await fetch('/api/admin/assignments')
  if (!res.ok) return []
  const data = await res.json()
  return data.assignments || []
}

async function fetchStudents() {
  const res = await fetch('/api/admin/students')
  if (!res.ok) return []
  const data = await res.json()
  return data.students || []
}

export default function AssignmentsPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<any[]>([])
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [studentListFilter, setStudentListFilter] = useState<string>('all') // 'all' | 'affected' | 'unaffected'
  const [forceModalOpen, setForceModalOpen] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [professors, setProfessors] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [forceForm, setForceForm] = useState({ studentId: '', supervisorId: '', topicId: '' })
  const [forceSubmitting, setForceSubmitting] = useState(false)
  const [forceError, setForceError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [list, studentsList] = await Promise.all([fetchAssignments(), fetchStudents()])
        setAssignments(list)
        setAllStudents(studentsList)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function openForceModal() {
    setForceModalOpen(true)
    setForceError('')
    setForceForm({ studentId: '', supervisorId: '', topicId: '' })
    try {
      const [studentsRes, professorsRes, topicsRes] = await Promise.all([
        fetch('/api/admin/students'),
        fetch('/api/admin/professors'),
        fetch('/api/admin/topics'),
      ])
      const studentsData = studentsRes.ok ? (await studentsRes.json()).students || [] : []
      const professorsData = professorsRes.ok ? (await professorsRes.json()).professors || [] : []
      const topicsData = topicsRes.ok ? (await topicsRes.json()).topics || [] : []
      setStudents((studentsData as any[]).filter((s: any) => !s.hasPfe))
      setProfessors(professorsData)
      setTopics((topicsData as any[]).filter((t: any) => t.status === 'approved'))
    } catch (e) {
      console.error(e)
    }
  }

  async function submitForceAssignment(e: React.FormEvent) {
    e.preventDefault()
    if (!forceForm.studentId || !forceForm.supervisorId) {
      setForceError('Sélectionnez un étudiant et un encadrant')
      return
    }
    setForceSubmitting(true)
    setForceError('')
    try {
      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: forceForm.studentId,
          supervisorId: forceForm.supervisorId,
          topicId: forceForm.topicId || null,
          status: 'approved',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setForceError(data.error || 'Erreur')
        return
      }
      setAssignments(await fetchAssignments())
      setAllStudents(await fetchStudents())
      setForceModalOpen(false)
      router.refresh()
    } catch (e) {
      setForceError('Erreur réseau')
    } finally {
      setForceSubmitting(false)
    }
  }

  const handleAssign = async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/admin/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      if (res.ok) {
        setAssignments(await fetchAssignments())
        setAllStudents(await fetchStudents())
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating assignment:', error)
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

  // Get unique departments (from assignments and students)
  const allDepartments = ['informatique', 'gestion', 'finance', 'marketing', 'rh', 'comptabilite']
  const existingFromAssignments = assignments.map((a: any) => a.student?.department).filter(Boolean)
  const existingFromStudents = allStudents.map((s: any) => s.department).filter(Boolean)
  const departments = Array.from(new Set([...existingFromAssignments, ...existingFromStudents, ...allDepartments]))

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment: any) => {
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter
    const matchesDepartment = departmentFilter === 'all' || assignment.student?.department === departmentFilter
    return matchesStatus && matchesDepartment
  })

  const pendingAssignments = filteredAssignments.filter((a: any) => a.status === 'pending')
  const assigned = filteredAssignments.filter((a: any) => a.status === 'approved')
  const rejected = filteredAssignments.filter((a: any) => a.status === 'rejected')

  // Student list: filter by affected/unaffected and department
  const assignmentByStudentId = assignments.reduce((acc: Record<string, any>, a: any) => {
    const sid = a.student_id || a.student?.id
    if (sid) acc[sid] = a
    return acc
  }, {})
  const filteredStudentList = allStudents.filter((s: any) => {
    const hasPfe = s.hasPfe || !!assignmentByStudentId[s.id]
    const matchesAffection = studentListFilter === 'all' || (studentListFilter === 'affected' && hasPfe) || (studentListFilter === 'unaffected' && !hasPfe)
    const matchesDept = departmentFilter === 'all' || s.department === departmentFilter
    return matchesAffection && matchesDept
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Affectations</span>
          </h1>
          <p className="text-gray-600 text-lg">Affectez les encadrants aux étudiants</p>
        </div>
        <button
          type="button"
          onClick={openForceModal}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm transition-all shrink-0"
        >
          Forcer une affectation
        </button>
      </div>

      {forceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setForceModalOpen(false)}>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Forcer une affectation</h2>
              <button type="button" onClick={() => setForceModalOpen(false)} className="p-2 text-gray-600 hover:text-gray-900 rounded-lg">✕</button>
            </div>
            <form onSubmit={submitForceAssignment} className="p-6 space-y-4">
              {forceError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{forceError}</div>}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Étudiant *</label>
                <select
                  value={forceForm.studentId}
                  onChange={e => setForceForm(f => ({ ...f, studentId: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200"
                >
                  <option value="">Sélectionner un étudiant</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.full_name || s.name || s.email} {s.department ? `(${s.department})` : ''}</option>
                  ))}
                </select>
                <p className="text-gray-500 text-xs mt-1">Seuls les étudiants sans affectation sont listés.</p>
                {students.length === 0 && <p className="text-amber-600 text-xs mt-1 font-medium">Tous les étudiants ont déjà un PFE assigné.</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Encadrant *</label>
                <select
                  value={forceForm.supervisorId}
                  onChange={e => setForceForm(f => ({ ...f, supervisorId: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200"
                >
                  <option value="">Sélectionner un encadrant</option>
                  {professors.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.full_name || p.name || p.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Sujet (optionnel)</label>
                <select
                  value={forceForm.topicId}
                  onChange={e => setForceForm(f => ({ ...f, topicId: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200"
                >
                  <option value="">Aucun sujet</option>
                  {topics
                    .filter((t: any) => {
                      const pid = Array.isArray(t.professor) ? t.professor[0]?.id : t.professor?.id
                      return !forceForm.supervisorId || pid === forceForm.supervisorId
                    })
                    .map((t: any) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                </select>
              </div>
              <p className="text-gray-600 text-xs">L&apos;affectation sera automatiquement confirmée et apparaîtra dans la liste des affectations confirmées.</p>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={forceSubmitting || !forceForm.studentId || !forceForm.supervisorId} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50">
                  {forceSubmitting ? 'Création...' : 'Créer l\'affectation'}
                </button>
                <button type="button" onClick={() => setForceModalOpen(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Liste des étudiants
          </label>
          <select
            value={studentListFilter}
            onChange={(e) => setStudentListFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200 transition-colors"
          >
            <option value="all">Tous les étudiants</option>
            <option value="affected">Avec affectation</option>
            <option value="unaffected">Sans affectation</option>
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Statut affectation
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200 transition-colors"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
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

      {/* Student list with filter */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Liste des étudiants ({filteredStudentList.length})
          {studentListFilter === 'affected' && <span className="text-lg font-normal text-gray-500"> — Avec affectation</span>}
          {studentListFilter === 'unaffected' && <span className="text-lg font-normal text-gray-500"> — Sans affectation</span>}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudentList.map((s: any) => {
            const assignment = assignmentByStudentId[s.id]
            const isAffected = !!assignment || s.hasPfe
            return (
              <div
                key={s.id}
                className={`rounded-2xl border p-5 shadow-sm ${
                  isAffected ? 'bg-white border-emerald-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-gray-900 font-semibold text-sm shrink-0">
                    {(s.full_name || s.name || 'N/A').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900 font-semibold truncate">{s.full_name || s.name || 'N/A'}</p>
                    <p className="text-gray-600 text-sm truncate">{s.email || '—'}</p>
                    {s.department && <p className="text-gray-500 text-xs mt-0.5">{s.department}</p>}
                    {isAffected && assignment ? (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-emerald-700 text-xs font-medium">Encadrant: {assignment.supervisor?.full_name || assignment.supervisor?.name || '—'}</p>
                        <p className="text-gray-600 text-xs">Sujet: {assignment.topic?.title || '—'}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                          assignment.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                          assignment.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {assignment.status === 'approved' ? 'Confirmé' : assignment.status === 'pending' ? 'En attente' : 'Rejeté'}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-2 text-amber-600 text-xs font-medium">Sans affectation</p>
                    )}
                  </div>
                </div>
                {isAffected && assignment && (
                  <Link
                    href={`/dashboard/admin/assignments/${assignment.id}`}
                    className="mt-3 block text-center py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Voir / Modifier
                  </Link>
                )}
              </div>
            )
          })}
        </div>
        {filteredStudentList.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Aucun étudiant ne correspond aux filtres.</p>
          </div>
        )}
      </div>

      {pendingAssignments.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">En attente d'affectation ({pendingAssignments.length})</h2>
          <div className="grid grid-cols-1 gap-6">
            {pendingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="relative bg-white rounded-2xl border border-orange-500/30 p-6 shadow-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Étudiant</h3>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-gray-900 font-semibold text-sm">
                        {(assignment.student?.full_name || assignment.student?.name || 'N/A').split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold">{assignment.student?.full_name || assignment.student?.name || 'N/A'}</p>
                        <p className="text-gray-600 text-sm">{assignment.student?.email || 'N/A'}</p>
                        <p className="text-gray-500 text-xs mt-1">{assignment.student?.department || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Sujet & Encadrant</h3>
                    <div>
                      <p className="text-gray-900 font-semibold mb-1">{assignment.topic?.title || 'N/A'}</p>
                      <p className="text-gray-600 text-sm">{assignment.topic?.professor?.full_name || assignment.supervisor?.full_name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleAssign(assignment.id)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25"
                  >
                    Confirmer l'affectation
                  </button>
                  <Link
                    href={`/dashboard/admin/assignments/${assignment.id}`}
                    className="px-4 py-2 bg-gray-100 text-white rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold text-sm"
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
          <h2 className="text-2xl font-bold text-gray-900">Affectations confirmées ({assigned.length})</h2>
          <div className="grid grid-cols-1 gap-6">
            {assigned.map((assignment) => (
              <div
                key={assignment.id}
                className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Étudiant</h3>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-gray-900 font-semibold text-sm">
                        {(assignment.student?.full_name || assignment.student?.name || 'N/A').split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold">{assignment.student?.full_name || assignment.student?.name || 'N/A'}</p>
                        <p className="text-gray-600 text-sm">{assignment.student?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Sujet & Encadrant</h3>
                    <div>
                      <p className="text-gray-900 font-semibold mb-1">{assignment.topic?.title || 'N/A'}</p>
                      <p className="text-gray-600 text-sm">{assignment.topic?.professor?.full_name || assignment.supervisor?.full_name || 'N/A'}</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Affectations rejetées ({rejected.length})</h2>
          <div className="grid grid-cols-1 gap-6">
            {rejected.map((assignment) => (
              <div
                key={assignment.id}
                className="relative bg-white rounded-2xl border border-red-500/30 p-6 shadow-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Étudiant</h3>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-gray-900 font-semibold text-sm">
                        {(assignment.student?.full_name || assignment.student?.name || 'N/A').split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold">{assignment.student?.full_name || assignment.student?.name || 'N/A'}</p>
                        <p className="text-gray-600 text-sm">{assignment.student?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Sujet & Encadrant</h3>
                    <div>
                      <p className="text-gray-900 font-semibold mb-1">{assignment.topic?.title || 'N/A'}</p>
                      <p className="text-gray-600 text-sm">{assignment.topic?.professor?.full_name || assignment.supervisor?.full_name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingAssignments.length === 0 && assigned.length === 0 && rejected.length === 0 && (
        <div className="relative bg-white rounded-2xl border border-gray-200 p-12 shadow-xl text-center">
          <p className="text-gray-600 text-lg">Aucune affectation trouvée</p>
        </div>
      )}
    </div>
  )
}


