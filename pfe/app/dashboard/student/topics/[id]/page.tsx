'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TopicDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (id) {
      async function fetchTopic() {
        try {
          const res = await fetch(`/api/student/topics/${id}`)
          if (res.ok) {
            const result = await res.json()
            setData(result)
          }
        } catch (error) {
          console.error('Error fetching topic:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchTopic()
    }
  }, [id])

  const handleApply = async () => {
    if (!confirm('Êtes-vous sûr de vouloir postuler pour ce sujet ?')) {
      return
    }

    setApplying(true)
    try {
      const res = await fetch('/api/student/topics/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: id }),
      })

      if (res.ok) {
        alert('Candidature envoyée avec succès')
        // Refresh data
        const refreshRes = await fetch(`/api/student/topics/${id}`)
        if (refreshRes.ok) {
          const result = await refreshRes.json()
          setData(result)
        }
      } else {
        const error = await res.json()
        alert(error.error || 'Erreur lors de la candidature')
      }
    } catch (error) {
      console.error('Error applying:', error)
      alert('Erreur lors de la candidature')
    } finally {
      setApplying(false)
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

  if (!data || !data.topic) {
    return (
      <div className="space-y-8">
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-xl">
          <p className="text-gray-400 text-lg">Sujet non trouvé</p>
        </div>
      </div>
    )
  }

  const { topic, application, hasTopic } = data
  const professor = topic.professor

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/student/topics"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux sujets
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{topic.title}</h1>
          <p className="text-gray-400 text-lg">Détails du sujet de PFE</p>
        </div>
        {!hasTopic && !application && (
          <button
            onClick={handleApply}
            disabled={applying}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {applying ? 'Envoi...' : 'Postuler pour ce sujet'}
          </button>
        )}
        {application && (
          <span
            className={`px-6 py-3 rounded-lg text-sm font-semibold border ${
              application.status === 'approved'
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50'
                : application.status === 'rejected'
                ? 'bg-red-500/20 text-red-200 border-red-500/50'
                : 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50'
            }`}
          >
            {application.status === 'approved'
              ? 'Candidature approuvée'
              : application.status === 'rejected'
              ? 'Candidature rejetée'
              : 'Candidature en attente'}
          </span>
        )}
        {hasTopic && (
          <span className="px-6 py-3 bg-blue-500/20 text-blue-200 border border-blue-500/50 rounded-lg text-sm font-semibold">
            Sujet déjà assigné
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Description</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{topic.description || 'Aucune description'}</p>
          </div>

          {topic.requirements && (
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Prérequis et compétences</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{topic.requirements}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Informations</h3>
            <div className="space-y-4">
              {topic.department && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Département</p>
                  <p className="text-white font-medium capitalize">{topic.department}</p>
                </div>
              )}
              {professor && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Encadrant</p>
                  <p className="text-white font-medium">{professor.full_name}</p>
                  {professor.email && (
                    <a
                      href={`mailto:${professor.email}`}
                      className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
                    >
                      {professor.email}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {professor && (professor.office || professor.office_hours || professor.bio) && (
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">À propos de l'encadrant</h3>
              <div className="space-y-4">
                {professor.office && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bureau</p>
                    <p className="text-white font-medium text-sm">{professor.office}</p>
                  </div>
                )}
                {professor.office_hours && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Heures de bureau</p>
                    <p className="text-white font-medium text-sm">{professor.office_hours}</p>
                  </div>
                )}
                {professor.bio && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Biographie</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{professor.bio}</p>
                  </div>
                )}
                {professor.expertise && Array.isArray(professor.expertise) && professor.expertise.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Domaines d'expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {professor.expertise.map((exp: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 rounded-lg text-xs font-semibold"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
