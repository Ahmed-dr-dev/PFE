'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function ProfessorDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfessor() {
      try {
        const res = await fetch(`/api/admin/professors/${id}`)
        if (res.ok) {
          const data = await res.json()
          setData(data)
        }
      } catch (error) {
        console.error('Error fetching professor:', error)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProfessor()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-8">
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-2xl">
          <p className="text-gray-400 text-lg">Enseignant non trouvé</p>
        </div>
      </div>
    )
  }
  
  const professor = data.professor
  const topics = data.topics || []
  const students = (data.students || []).map((s: any) => ({
    id: s.student?.id || s.id,
    full_name: s.student?.full_name || 'N/A',
    progress: s.progress || 0,
    status: s.status,
  }))
  const topicsCount = data.topicsCount || topics.length
  const studentsCount = data.studentsCount || students.length

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/admin/professors"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux enseignants
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{professor?.name || professor?.full_name || 'N/A'}</h1>
          <p className="text-gray-400 text-lg">Profil enseignant et statistiques</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Sujets proposés</h2>
            <div className="space-y-4">
              {topics && topics.length > 0 ? topics.map((topic: any) => (
                <div
                  key={topic.id}
                  className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">{topic.title}</h3>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      topic.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50'
                        : topic.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50'
                        : 'bg-gray-500/20 text-gray-200 border-gray-500/50'
                    }`}>
                      {topic.status === 'approved' ? 'Approuvé' : topic.status === 'pending' ? 'En attente' : 'Rejeté'}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-gray-400 text-sm text-center py-8">Aucun sujet proposé</p>
              )}
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Étudiants encadrés</h2>
            <div className="space-y-4">
              {students && students.length > 0 ? students.map((student: any) => (
                <div
                  key={student.id}
                  className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">{student.full_name || 'N/A'}</h3>
                    <span className="text-white font-semibold">{student.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${student.progress || 0}%` }}
                    />
                  </div>
                </div>
              )) : (
                <p className="text-gray-400 text-sm text-center py-8">Aucun étudiant encadré</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold text-2xl shadow-lg mb-4">
              {(professor?.name || professor?.full_name || 'N/A').split(' ').slice(1).map((n: string) => n[0]).join('')}
            </div>
            <h3 className="text-lg font-bold text-white mb-4">Informations</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                <p className="text-white font-medium text-sm">{professor?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Téléphone</p>
                <p className="text-white font-medium text-sm">{professor?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Département</p>
                <p className="text-white font-medium text-sm">{professor?.department || 'N/A'}</p>
              </div>
              {professor?.office && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bureau</p>
                  <p className="text-white font-medium text-sm">{professor.office}</p>
                </div>
              )}
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Sujets proposés</p>
                <p className="text-2xl font-bold text-white">{topicsCount || (topics ? topics.length : 0)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Étudiants encadrés</p>
                <p className="text-2xl font-bold text-white">{studentsCount || (students ? students.length : 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


