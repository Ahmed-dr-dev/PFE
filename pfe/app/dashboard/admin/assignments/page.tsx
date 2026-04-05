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
  const [profSpecialityFilter, setProfSpecialityFilter] = useState<string>('all')

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

  const availableProfessors = professors
    .map((p: any) => {
      const capacity = Number(p.supervisionCapacity ?? 8)
      const count = Number(p.studentsCount ?? 0)
      const available = Math.max(0, capacity - count)
      return { ...p, capacity, count, available }
    })
    .filter((p: any) => p.available > 0)
    .filter((p: any) => profSpecialityFilter === 'all' || p.department === profSpecialityFilter)

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
                <label className="block text-sm font-semibold text-gray-600 mb-1">Étudiant</label>
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
                <label className="block text-sm font-semibold text-gray-600 mb-1">Encadrant</label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={profSpecialityFilter}
                    onChange={(e) => {
                      setProfSpecialityFilter(e.target.value)
                      setForceForm((f) => ({ ...f, supervisorId: '' }))
                    }}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200"
                  >
                    <option value="all">Toutes spécialités</option>
                    {allDepartments.map((d) => (
                      <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <select
                  value={forceForm.supervisorId}
                  onChange={e => setForceForm(f => ({ ...f, supervisorId: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200"
                >
                  <option value="">Sélectionner un encadrant</option>
                  {availableProfessors.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || p.name || p.email} — {p.available} place(s) dispo
                      {p.department ? ` (${p.department})` : ''}
                    </option>
                  ))}
                </select>
                {availableProfessors.length === 0 && (
                  <p className="text-amber-600 text-xs mt-1 font-medium">
                    Aucun encadrant n&apos;a de places disponibles (ou filtre trop restrictif).
                  </p>
                )}
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
        {filteredStudentList.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-[720px] w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Étudiant</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Département</th>
                  <th className="px-4 py-3">Encadrant</th>
                  <th className="px-4 py-3 min-w-[140px]">Sujet</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudentList.map((s: any) => {
                  const assignment = assignmentByStudentId[s.id]
                  const isAffected = !!assignment || s.hasPfe
                  return (
                    <tr
                      key={s.id}
                      className={isAffected && assignment ? 'bg-emerald-50/40' : 'bg-white hover:bg-gray-50/80'}
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                        {s.full_name || s.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={s.email || ''}>
                        {s.email || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{s.department || '—'}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {isAffected && assignment
                          ? assignment.supervisor?.full_name || assignment.supervisor?.name || '—'
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[220px] truncate" title={assignment?.topic?.title || ''}>
                        {isAffected && assignment ? assignment.topic?.title || '—' : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {isAffected && assignment ? (
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                              assignment.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : assignment.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {assignment.status === 'approved'
                              ? 'Confirmé'
                              : assignment.status === 'pending'
                                ? 'En attente'
                                : 'Rejeté'}
                          </span>
                        ) : (
                          <span className="text-amber-700 text-xs font-medium">Sans affectation</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {isAffected && assignment ? (
                          <Link
                            href={`/dashboard/admin/assignments/${assignment.id}`}
                            className="text-emerald-600 hover:text-emerald-800 font-medium"
                          >
                            Voir
                          </Link>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Aucun étudiant ne correspond aux filtres.</p>
          </div>
        )}
      </div>

      {pendingAssignments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">En attente d&apos;affectation ({pendingAssignments.length})</h2>
          <div className="overflow-x-auto rounded-xl border border-amber-200/60 bg-white shadow-sm">
            <table className="min-w-[800px] w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-amber-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Étudiant</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Département</th>
                  <th className="px-4 py-3 min-w-[160px]">Sujet</th>
                  <th className="px-4 py-3">Encadrant</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-amber-50/30">
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {assignment.student?.full_name || assignment.student?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={assignment.student?.email || ''}>
                      {assignment.student?.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{assignment.student?.department || '—'}</td>
                    <td className="px-4 py-3 text-gray-800 max-w-[220px] truncate" title={assignment.topic?.title || ''}>
                      {assignment.topic?.title || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {assignment.topic?.professor?.full_name || assignment.supervisor?.full_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleAssign(assignment.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-xs"
                        >
                          Confirmer
                        </button>
                        <Link
                          href={`/dashboard/admin/assignments/${assignment.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 font-semibold text-xs"
                        >
                          Modifier
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {assigned.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Affectations confirmées ({assigned.length})</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-[720px] w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Étudiant</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 min-w-[160px]">Sujet</th>
                  <th className="px-4 py-3">Encadrant</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assigned.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {assignment.student?.full_name || assignment.student?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={assignment.student?.email || ''}>
                      {assignment.student?.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-800 max-w-[220px] truncate" title={assignment.topic?.title || ''}>
                      {assignment.topic?.title || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {assignment.topic?.professor?.full_name || assignment.supervisor?.full_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/admin/assignments/${assignment.id}`}
                        className="text-emerald-600 hover:text-emerald-800 font-medium"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rejected.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Affectations rejetées ({rejected.length})</h2>
          <div className="overflow-x-auto rounded-xl border border-red-200/60 bg-white shadow-sm">
            <table className="min-w-[720px] w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-red-50/40 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Étudiant</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 min-w-[160px]">Sujet</th>
                  <th className="px-4 py-3">Encadrant</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rejected.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-red-50/20">
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {assignment.student?.full_name || assignment.student?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={assignment.student?.email || ''}>
                      {assignment.student?.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-800 max-w-[220px] truncate" title={assignment.topic?.title || ''}>
                      {assignment.topic?.title || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {assignment.topic?.professor?.full_name || assignment.supervisor?.full_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/admin/assignments/${assignment.id}`}
                        className="text-emerald-600 hover:text-emerald-800 font-medium"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pendingAssignments.length === 0 && assigned.length === 0 && rejected.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-600">Aucune affectation ne correspond aux filtres de statut / département.</p>
        </div>
      )}
    </div>
  )
}


