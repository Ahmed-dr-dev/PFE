import Link from 'next/link'
import { TopicActions } from './topic-actions'

async function getTopics() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/topics`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.topics || []
  } catch (error) {
    return []
  }
}

export default async function TopicsPage() {
  const topics = await getTopics()

  const pendingTopics = topics.filter((t: any) => t.status === 'pending')
  const approvedTopics = topics.filter((t: any) => t.status === 'approved')

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Sujets à <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">valider</span>
          </h1>
          <p className="text-gray-400 text-lg">Validez les sujets de PFE proposés par les enseignants</p>
        </div>
      </div>

      {pendingTopics.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">En attente de validation ({pendingTopics.length})</h2>
          <div className="grid grid-cols-1 gap-6">
            {pendingTopics.map((topic: any) => (
              <div
                key={topic.id}
                className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{topic.title}</h3>
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold border bg-yellow-500/20 text-yellow-200 border-yellow-500/50">
                        En attente
                      </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-3">{topic.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{topic.professor?.full_name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>{topic.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(topic.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                  <TopicActions topicId={topic.id} />
                  <Link
                    href={`/dashboard/admin/topics/${topic.id}`}
                    className="ml-auto px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold text-sm"
                  >
                    Voir détails
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {approvedTopics.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Sujets approuvés ({approvedTopics.length})</h2>
          <div className="grid grid-cols-1 gap-6">
            {approvedTopics.map((topic: any) => (
              <div
                key={topic.id}
                className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{topic.title}</h3>
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold border bg-emerald-500/20 text-emerald-200 border-emerald-500/50">
                        Approuvé
                      </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-3">{topic.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{topic.professor?.full_name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>{topic.department}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingTopics.length === 0 && approvedTopics.length === 0 && (
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 shadow-xl text-center">
          <p className="text-gray-400 text-lg">Aucun sujet à valider</p>
        </div>
      )}
    </div>
  )
}


