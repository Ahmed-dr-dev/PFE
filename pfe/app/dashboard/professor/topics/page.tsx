'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function TopicsPage() {
  const [topics, setTopics] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    fetchTopics().then(setTopics)
  }, [])

    async function fetchTopics() {
    try {
      const response = await fetch('/api/professor/topics', {
        cache: 'no-store',
      })
      console.log(response)
      if (!response.ok) return []
      const data = await response.json()
      return data.topics || []
    } catch (error) {
      return []
    }
  }

  const filteredTopics = topics.filter((topic: any) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      topic.title?.toLowerCase().includes(query) ||
      topic.description?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Mes <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">sujets</span>
          </h1>
          <p className="text-gray-600 text-lg">Gérez tous vos sujets de PFE proposés</p>
        </div>
        <Link
          href="/dashboard/professor/topics/new"
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Proposer un sujet
        </Link>
      </div>

      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un sujet par titre ou description..."
            className="w-full px-4 py-3 pl-12 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 transition-colors"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredTopics.length > 0 ? filteredTopics.map((topic: any) => (
          <div
            key={topic.id}
            className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-xl hover:border-emerald-200 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{topic.title}</h3>
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold border bg-gray-100 text-gray-900">
                    {topic.status}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{topic.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{Array.isArray(topic.applications) ? topic.applications.length : topic.applications || 0} demandes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{Array.isArray(topic.projects) ? topic.projects.length : topic.assigned || 0} affecté(s)</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Link
                  href={`/dashboard/professor/topics/${topic.id}`}
                  className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold text-sm"
                >
                  Voir détails
                </Link>
              </div>
            </div>
          </div>
        )) : (
          <div className="relative bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xl">
            <p className="text-gray-600 text-lg">
              {searchQuery ? 'Aucun sujet trouvé pour votre recherche' : 'Aucun sujet proposé'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


