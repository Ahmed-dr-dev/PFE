'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function StudentDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStudent() {
      try {
        const res = await fetch(`/api/admin/students/${id}`)
        if (res.ok) {
          const data = await res.json()
          setData(data)
        }
      } catch (error) {
        console.error('Error fetching student:', error)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchStudent()
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
          <p className="text-gray-400 text-lg">Étudiant non trouvé</p>
        </div>
      </div>
    )
  }
  
  const student = data.student
  const topic = data.topic || null
  const supervisor = data.supervisor || null
  const project = {
    status: data.status,
    progress: data.progress,
    start_date: data.startDate,
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/admin/students"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux étudiants
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{student?.name || student?.full_name || 'N/A'}</h1>
          <p className="text-gray-400 text-lg">Profil étudiant et informations du PFE</p>
        </div>
        {!data.pfe && (
          <Link
            href={`/dashboard/admin/assignments?student=${student.id}`}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm"
          >
            Affecter un encadrant
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {topic ? (
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Sujet de PFE</h2>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-3">{topic.title}</h3>
              {topic.description && (
                <p className="text-gray-300 leading-relaxed mb-4">{topic.description}</p>
              )}
              {supervisor && (
                <p className="text-gray-400 text-sm mb-4">Encadrant: {supervisor.full_name || 'N/A'}</p>
              )}
            </div>
          
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <p className="text-gray-400 text-lg">Aucun PFE assigné</p>
          </div>
        )}

        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-2xl shadow-lg mb-4">
            {(student?.name || student?.full_name || 'N/A').split(' ').map((n: string) => n[0]).join('')}
          </div>
          <h3 className="text-lg font-bold text-white mb-4">Informations</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-white font-medium text-sm">{student?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Téléphone</p>
              <p className="text-white font-medium text-sm">{student?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Département</p>
              <p className="text-white font-medium text-sm">{student?.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Année</p>
              <p className="text-white font-medium text-sm">{student?.year || 'N/A'}</p>
            </div>
          </div>
        </div>

        {data.startDate && (
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Début du projet</p>
                <p className="text-white font-semibold">{new Date(data.startDate).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


