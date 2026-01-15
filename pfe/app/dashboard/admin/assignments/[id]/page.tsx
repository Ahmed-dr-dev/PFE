'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [assignment, setAssignment] = useState<any>(null)
  const [assignmentData, setAssignmentData] = useState<any>(null)
  const [professors, setProfessors] = useState<any[]>([])
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [assignmentData, professorsData] = await Promise.all([
        getAssignment(params.id),
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
    fetchData()
  }, [params.id])

  const handleAssign = async () => {
    if (!selectedSupervisor) {
      alert('Veuillez sélectionner un encadrant')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/assignments/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supervisor_id: selectedSupervisor }),
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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="space-y-8">
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-2xl">
          <p className="text-gray-400 text-lg">Affectation non trouvée</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/admin/assignments"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux affectations
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Affectation <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">encadrant</span>
          </h1>
          <p className="text-gray-400 text-lg">Affectez un encadrant à l'étudiant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Étudiant</h2>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-xl">
                {assignment.student?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'N/A'}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">{assignment.student?.full_name || 'N/A'}</h3>
                <p className="text-gray-400 text-sm">{assignment.student?.email || 'N/A'}</p>
                <p className="text-gray-500 text-xs mt-1">{assignment.student?.department || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Sujet de PFE</h2>
            {assignment.topic && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{assignment.topic.title || 'N/A'}</h3>
                {assignment.supervisor && (
                  <p className="text-gray-400 text-sm">Encadrant actuel: {assignment.supervisor.full_name || 'N/A'}</p>
                )}
              </div>
            )}
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Sélectionner un encadrant</h2>
            <div className="space-y-3">
              {professors && professors.length > 0 ? professors.map((prof: any) => (
                <button
                  key={prof.id}
                  onClick={() => setSelectedSupervisor(prof.id)}
                  className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                    selectedSupervisor === prof.id
                      ? 'bg-emerald-500/20 border-emerald-500/50'
                      : 'bg-slate-700/30 border-slate-600/50 hover:border-emerald-500/50'
                  }`}
                >
                  <h3 className="text-white font-semibold mb-1">{prof.full_name || 'N/A'}</h3>
                  <p className="text-gray-400 text-sm">{prof.department || 'N/A'}</p>
                </button>
              )) : (
                <p className="text-gray-400 text-sm text-center py-8">Aucun enseignant disponible</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Résumé</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Étudiant</p>
                <p className="text-white font-medium text-sm">{assignment.student?.full_name || 'N/A'}</p>
              </div>
              {assignment.topic && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sujet</p>
                  <p className="text-white font-medium text-sm">{assignment.topic.title || 'N/A'}</p>
                </div>
              )}
              {selectedSupervisor && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Encadrant</p>
                  <p className="text-white font-medium text-sm">
                    {professors.find((p: any) => p.id === selectedSupervisor)?.full_name || 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleAssign}
                disabled={saving || !selectedSupervisor}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Enregistrement...' : 'Confirmer l\'affectation'}
              </button>
              <Link
                href="/dashboard/admin/assignments"
                className="block w-full px-4 py-3 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold text-sm text-center"
              >
                Annuler
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


