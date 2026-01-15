'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { TopicActions } from './topic-actions'

export default function TopicDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [topic, setTopic] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTopic() {
      try {
        const res = await fetch(`/api/admin/topics/${id}`)
        if (res.ok) {
          const data = await res.json()
          setTopic(data.topic)
        }
      } catch (error) {
        console.error('Error fetching topic:', error)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchTopic()
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

  if (!topic) {
    return (
      <div className="space-y-8">
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-2xl">
          <p className="text-gray-400 text-lg">Sujet non trouvé</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/admin/topics"
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
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
            topic.status === 'approved'
              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50'
              : topic.status === 'pending'
              ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50'
              : 'bg-red-500/20 text-red-200 border-red-500/50'
          }`}>
            {topic.status === 'approved' ? 'Approuvé' : topic.status === 'pending' ? 'En attente' : 'Rejeté'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
            <p className="text-gray-300 leading-relaxed">{topic.description}</p>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Prérequis</h2>
            <p className="text-gray-300 leading-relaxed">{topic.requirements}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Informations</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Enseignant</p>
                <p className="text-white font-medium">{topic.professor?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Département</p>
                <p className="text-white font-medium">{topic.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Créé le</p>
                <p className="text-white font-medium">{new Date(topic.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Statut</p>
                <p className="text-white font-medium">En attente de validation</p>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
            <TopicActions topicId={topic.id} />
          </div>
        </div>
      </div>
    </div>
  )
}


