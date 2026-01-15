'use client'
import { TopicCard } from './topic-card'
import { useEffect, useState } from 'react'

export default function TopicsPage() {
  const [topics, setTopics] = useState<any[]>([])
  const [hasSupervisor, setHasSupervisor] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const topicsRes = await fetch('/api/student/topics', { cache: 'no-store' })
        if (topicsRes.ok) {
          const topicsData = await topicsRes.json()
          setTopics(topicsData.topics || [])
          setHasSupervisor(topicsData.hasSupervisor !== false)
        }
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Transform topics to match TopicCard expected format
  const formattedTopics = topics.map((topic: any) => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    teacher: topic.professor || { full_name: 'N/A', email: '' },
    department: topic.department || 'N/A',
    applicationStatus: topic.applicationStatus || null,
  }))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Sujets de PFE <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">disponibles</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Consultez les sujets proposés par votre encadrant
          </p>
        </div>
      </div>

      {!hasSupervisor && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-6 py-4 rounded-lg backdrop-blur-sm">
          <p className="font-medium">
            Vous n'avez pas encore d'encadrant assigné. Les sujets de votre encadrant apparaîtront ici une fois qu'un encadrant vous sera assigné.
          </p>
        </div>
      )}

      {loading ? (
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-xl">
          <p className="text-gray-400 text-lg">Chargement...</p>
        </div>
      ) : formattedTopics && formattedTopics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formattedTopics.map((topic: any) => (
            <TopicCard key={topic.id} topic={topic} hasPfe={false} />
          ))}
        </div>
      ) : (
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5" />
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
              <svg
                className="w-10 h-10 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-300 text-lg font-medium">
              {hasSupervisor 
                ? 'Aucun sujet disponible de votre encadrant pour le moment' 
                : 'Aucun encadrant assigné'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

