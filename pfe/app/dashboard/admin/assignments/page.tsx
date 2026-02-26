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

export default function AssignmentsPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [forceModalOpen, setForceModalOpen] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [professors, setProfessors] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [forceForm, setForceForm] = useState({ studentId: '', supervisorId: '', topicId: '', enforce: true })
  const [forceSubmitting, setForceSubmitting] = useState(false)
  const [forceError, setForceError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchAssignments()
        setAssignments(list)
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
    setForceForm({ studentId: '', supervisorId: '', topicId: '', enforce: true })
    try {
      const [studentsRes, professorsRes, topicsRes] = await Promise.all([
        fetch('/api/admin/students'),
        fetch('/api/admin/professors'),
        fetch('/api/admin/topics'),
      ])
      const studentsData = studentsRes.ok ? (await studentsRes.json()).students || [] : []
      const professorsData = professorsRes.ok ? (await professorsRes.json()).professors || [] : []
      const topicsData = topicsRes.ok ? (await topicsRes.json()).topics || [] : []
      setStudents(studentsData.filter((s: any) => !s.hasPfe))
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
          status: forceForm.enforce ? 'approved' : 'pending',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setForceError(data.error || 'Erreur')
        return
      }
      setAssignments(await fetchAssignments())
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
        const list = await fetchAssignments()
        setAssignments(list)
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
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Forcer une affectation</h2>
              <button type="button" onClick={() => setForceModalOpen(false)} className="p-2 text-gray-400 hover:text-white rounded-lg">✕</button>
            </div>
            <form onSubmit={submitForceAssignment} className="p-6 space-y-4">
              {forceError && <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">{forceError}</div>}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Étudiant *</label>
                <select
                  value={forceForm.studentId}
                  onChange={e => setForceForm(f => ({ ...f, studentId: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="">Sélectionner un étudiant</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.full_name || s.name || s.email} {s.department ? `(${s.department})` : ''}</option>
                  ))}
                </select>
                {students.length === 0 && <p className="text-gray-500 text-xs mt-1">Tous les étudiants ont déjà un PFE assigné.</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Encadrant *</label>
                <select
                  value={forceForm.supervisorId}
                  onChange={e => setForceForm(f => ({ ...f, supervisorId: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="">Sélectionner un encadrant</option>
                  {professors.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.full_name || p.name || p.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Sujet (optionnel)</label>
                <select
                  value={forceForm.topicId}
                  onChange={e => setForceForm(f => ({ ...f, topicId: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enforce"
                  checked={forceForm.enforce}
                  onChange={e => setForceForm(f => ({ ...f, enforce: e.target.checked }))}
                  className="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="enforce" className="text-sm text-gray-300">Approuver directement (forcer l&apos;affectation même si l&apos;encadrant n&apos;a pas validé)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={forceSubmitting || !forceForm.studentId || !forceForm.supervisorId} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50">
                  {forceSubmitting ? 'Création...' : 'Créer l\'affectation'}
                </button>
                <button type="button" onClick={() => setForceModalOpen(false)} className="px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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


