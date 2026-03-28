'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

async function getAssignment(id: string) {
  try {
    const res = await fetch(`/api/admin/assignments/${id}`)
    if (!res.ok) return null
    const data = await res.json()
    return data
  } catch (error) {
    return null
  }
}

async function getProfessors() {
  try {
    const res = await fetch('/api/admin/professors')
    if (!res.ok) return []
    const data = await res.json()
    return data.professors || []
  } catch (error) {
    return []
  }
}

export default function AssignmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [assignment, setAssignment] = useState<any>(null)
  const [assignmentData, setAssignmentData] = useState<any>(null)
  const [professors, setProfessors] = useState<any[]>([])
  const [profSpecialityFilter, setProfSpecialityFilter] = useState<string>('all')
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [assignmentData, professorsData] = await Promise.all([
        getAssignment(id),
        getProfessors(),
      ])
      setAssignmentData(assignmentData)
      setAssignment(assignmentData?.assignment || null)
      setProfessors(professorsData)
      if (assignmentData?.assignment?.supervisor?.id) {
        setSelectedSupervisor(assignmentData.assignment.supervisor.id)
      }
      setLoading(false)
    }
    if (id) fetchData()
  }, [id])

  const handleAssign = async () => {
    if (!selectedSupervisor) {
      alert('Veuillez sélectionner un encadrant')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/assignments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          supervisor_id: selectedSupervisor,
          status: 'approved'
        }),
      })

      if (res.ok) {
        router.push('/dashboard/admin/assignments')
      } else {
        const error = await res.json()
        alert(error.error || 'Erreur lors de l\'affectation')
      }
    } catch (error) {
      console.error('Error assigning supervisor:', error)
      alert('Erreur lors de l\'affectation')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveAssignment = async () => {
    if (
      !confirm(
        "Supprimer cette affectation ? L'étudiant n'aura plus de projet PFE ni d'encadrant associé (les documents liés peuvent être supprimés selon la base)."
      )
    ) {
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/assignments/${id}`, { method: 'DELETE' })

      if (res.ok) {
        router.push('/dashboard/admin/assignments')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error removing assignment:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setSaving(false)
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

  if (!assignment) {
    return (
      <div className="space-y-8">
        <div className="relative bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-2xl">
          <p className="text-gray-600 text-lg">Affectation non trouvée</p>
        </div>
      </div>
    )
  }

  const allDepartments = ['informatique', 'gestion', 'finance', 'marketing', 'rh', 'comptabilite']
  const availableProfessors = professors
    .map((p: any) => {
      const capacity = Number(p.supervisionCapacity ?? 8)
      const count = Number(p.studentsCount ?? 0)
      const available = Math.max(0, capacity - count)
      return { ...p, capacity, count, available }
    })
    .filter((p: any) => p.available > 0 || p.id === selectedSupervisor) // keep current selection visible
    .filter((p: any) => profSpecialityFilter === 'all' || p.department === profSpecialityFilter)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/admin/assignments"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux affectations
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Affectation <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">encadrant</span>
          </h1>
          <p className="text-gray-600 text-lg">Affectez un encadrant à l'étudiant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Étudiant</h2>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-gray-900 font-semibold text-xl">
                {assignment.student?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'N/A'}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{assignment.student?.full_name || 'N/A'}</h3>
                <p className="text-gray-600 text-sm">{assignment.student?.email || 'N/A'}</p>
                <p className="text-gray-500 text-xs mt-1">{assignment.student?.department || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sujet de PFE</h2>
            {assignment.topic && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{assignment.topic.title || 'N/A'}</h3>
                {assignment.topic.description && (
                  <p className="text-gray-700 text-sm mb-4">{assignment.topic.description}</p>
                )}
                {assignment.topic.professor && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Professeur proposant</p>
                    <p className="text-gray-600 text-sm">{assignment.topic.professor.full_name || 'N/A'}</p>
                    {assignment.topic.professor.email && (
                      <p className="text-gray-500 text-xs mt-1">{assignment.topic.professor.email}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {assignment.supervisor && (
            <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Encadrant assigné</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-gray-900 font-semibold text-xl">
                  {(assignment.supervisor.full_name || 'N/A').split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{assignment.supervisor.full_name || 'N/A'}</h3>
                  {assignment.supervisor.email && (
                    <p className="text-gray-600 text-sm mb-2">{assignment.supervisor.email}</p>
                  )}
                  {assignment.supervisor.department && (
                    <p className="text-gray-500 text-xs">{assignment.supervisor.department}</p>
                  )}
                </div>
              </div>
            </div>
          )}

        
        </div>

        <div className="space-y-6">
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Résumé</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Étudiant</p>
                <p className="text-gray-900 font-medium text-sm">{assignment.student?.full_name || 'N/A'}</p>
              </div>
              {assignment.topic && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sujet</p>
                  <p className="text-gray-900 font-medium text-sm">{assignment.topic.title || 'N/A'}</p>
                </div>
              )}
              {assignment.supervisor && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Encadrant actuel</p>
                  <p className="text-gray-900 font-medium text-sm">{assignment.supervisor.full_name || 'N/A'}</p>
                  {assignment.supervisor.email && (
                    <p className="text-gray-500 text-xs mt-1">{assignment.supervisor.email}</p>
                  )}
                  {assignment.supervisor.department && (
                    <p className="text-gray-500 text-xs">{assignment.supervisor.department}</p>
                  )}
                </div>
              )}
              {selectedSupervisor && selectedSupervisor !== assignment.supervisor?.id && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nouvel encadrant</p>
                  <p className="text-gray-900 font-medium text-sm">
                    {professors.find((p: any) => p.id === selectedSupervisor)?.full_name || 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {assignment.status === 'pending' && (
                <>
                  <button
                    onClick={handleAssign}
                    disabled={saving || !selectedSupervisor}
                    className="w-full px-4 py-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:bg-emerald-800 transition-colors font-bold text-sm shadow-md shadow-emerald-900/20 ring-2 ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:ring-0"
                  >
                    {saving ? 'Enregistrement...' : 'Confirmer l\'affectation'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveAssignment}
                    disabled={saving}
                    className="w-full px-4 py-3.5 bg-red-600 text-white rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors font-bold text-sm shadow-md shadow-red-900/20 ring-2 ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:ring-0"
                  >
                    {saving ? 'Suppression...' : 'Annuler l\'affectation'}
                  </button>
                </>
              )}
              {assignment.status !== 'pending' && (
                <button
                  type="button"
                  onClick={handleRemoveAssignment}
                  disabled={saving}
                  className="w-full px-4 py-3.5 bg-white text-gray-900 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-colors font-bold text-sm text-center shadow-sm disabled:opacity-50"
                >
                  Annuler
                </button>
              )}
              <Link
                href="/dashboard/admin/assignments"
                className="block w-full px-4 py-3 text-center text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                Retour à la liste sans supprimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


