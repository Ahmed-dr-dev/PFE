'use client'

interface Topic {
  id: string
  title: string
  description: string | null
  teacher: { full_name: string; email: string } | null
  department: string | null
}

export function TopicCard({ topic, hasPfe }: { topic: Topic; hasPfe: boolean }) {
  function handleChoose() {
    // Design only - no API call
  }

  return (
    <div className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-emerald-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 rounded-2xl transition-all duration-300" />
      <div className="relative">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-3 leading-tight">{topic.title}</h3>
          {topic.description && (
            <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">{topic.description}</p>
          )}
        </div>

        <div className="space-y-3 mb-6">
          {topic.teacher && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center border border-slate-600/50">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="text-gray-300 font-medium">{topic.teacher.full_name}</span>
            </div>
          )}
          {topic.department && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center border border-slate-600/50">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <span className="text-gray-300 capitalize font-medium">{topic.department}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleChoose}
          disabled={hasPfe}
          className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-emerald-700 hover:to-cyan-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 disabled:hover:translate-y-0"
        >
          {hasPfe ? 'Déjà assigné' : 'Choisir ce sujet'}
        </button>
      </div>
    </div>
  )
}

