'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [availableStudents, setAvailableStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch('/api/professor/students', {
          cache: 'no-store',
        })
        if (!res.ok) return
        const data = await res.json()
        setStudents(data.students || [])
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  useEffect(() => {
    if (showModal) {
      async function fetchData() {
        try {
          const studentsRes = await fetch('/api/professor/assignments')
          if (studentsRes.ok) {
            const studentsData = await studentsRes.json()
            setAvailableStudents(studentsData.students || [])
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
      fetchData()
    }
  }, [showModal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) {
      alert('Veuillez sélectionner un étudiant')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/professor/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
        }),
      })

      if (res.ok) {
        alert('Étudiant ajouté à votre supervision avec succès')
        setShowModal(false)
        setSelectedStudent('')
        // Refresh students list
        const studentsRes = await fetch('/api/professor/students', { cache: 'no-store' })
        if (studentsRes.ok) {
          const data = await studentsRes.json()
          setStudents(data.students || [])
        }
      } else {
        const error = await res.json()
        alert(error.error || 'Erreur lors de l\'ajout de l\'étudiant')
      }
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Erreur lors de l\'ajout de l\'étudiant')
    } finally {
      setSubmitting(false)
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50',
    in_progress: 'bg-blue-500/20 text-blue-200 border-blue-500/50',
    completed: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50',
  }

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    in_progress: 'En cours',
    rejected: 'Rejeté',
    completed: 'Terminé',
    approved: 'Approuvé',
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Mes <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">étudiants</span>
          </h1>
          <p className="text-gray-400 text-lg">Gérez et encadrez vos étudiants affectés</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold"
        >
          Ajouter un étudiant
        </button>
      </div>

      {loading ? (
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-xl">
          <p className="text-gray-400 text-lg">Chargement...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {students && students.length > 0 ? students.map((student: any) => (
          <div
            key={student.id}
            className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl hover:border-emerald-500/50 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                  {student.full_name?.split(' ').map((n: string) => n[0]).join('') || 'N/A'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-white">{student.full_name || student.name || 'N/A'}</h3>
                 
                    {student.status && (
                      console.log(student.status),
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border backdrop-blur-sm ${
                          statusColors[student.status] || statusColors.pending
                        }`}
                      >
                        {statusLabels[student.status]}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{student.email || 'N/A'}</p>
                  <p className="text-gray-300 font-medium">{student.topic?.title || 'N/A'}</p>
                </div>
              </div>
            </div>

          

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-700/50">
              {student.last_meeting && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Dernière rencontre: {new Date(student.last_meeting).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
              <div className="ml-auto flex items-center gap-2">
                <Link
                  href={`/dashboard/professor/students/${student.id}`}
                  className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold text-sm"
                >
                  Voir profil
                </Link>
                <Link
                  href={`/dashboard/professor/students/${student.id}/meetings`}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/50 text-emerald-200 rounded-lg hover:from-emerald-600/30 hover:to-cyan-600/30 transition-all duration-200 font-semibold text-sm"
                >
                  Planifier
                </Link>
              </div>
            </div>
          </div>
        )) : (
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-xl">
            <p className="text-gray-400 text-lg">Aucun étudiant assigné</p>
          </div>
        )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowModal(false)
                setSelectedStudent('')
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Ajouter un étudiant à votre supervision</h2>
            <p className="text-gray-400 text-sm mb-6">L'étudiant pourra ensuite appliquer pour vos sujets approuvés.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Étudiant
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  required
                >
                  <option value="">Sélectionner un étudiant</option>
                  {availableStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} - {student.email} {student.department ? `(${student.department})` : ''}
                    </option>
                  ))}
                </select>
                {availableStudents.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">Aucun étudiant disponible (tous ont déjà un encadrant)</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || availableStudents.length === 0 || !selectedStudent}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Ajout...' : 'Ajouter l\'étudiant'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setSelectedStudent('')
                  }}
                  className="px-6 py-3 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

