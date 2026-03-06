'use client'

import Link from 'next/link'

interface Topic {
  id: string
  title: string
  description: string | null
  teacher: { full_name: string; email: string } | null
  department: string | null
  applicationStatus?: string | null
}

export function TopicCard({ topic, hasPfe }: { topic: Topic; hasPfe: boolean }) {
  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-emerald-200 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 rounded-2xl transition-all duration-300" />
      <div className="relative">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{topic.title}</h3>
          {topic.description && (
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{topic.description}</p>
          )}
        </div>

        <div className="space-y-3 mb-6">
          {topic.teacher && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
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
              <span className="text-gray-700 font-medium">{topic.teacher.full_name}</span>
            </div>
          )}
          {topic.department && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
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
              <span className="text-gray-700 capitalize font-medium">{topic.department}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            href={`/dashboard/student/topics/${topic.id}`}
            className="flex-1 bg-gray-100 text-gray-900 py-3 px-4 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200 text-sm text-center"
          >
            Voir détails
          </Link>
          {topic.applicationStatus && (
            <span
              className={`px-3 py-3 rounded-xl text-xs font-semibold border ${
                topic.applicationStatus === 'approved'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : topic.applicationStatus === 'rejected'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-yellow-50 text-yellow-800 border-yellow-200'
              }`}
            >
              {topic.applicationStatus === 'approved'
                ? 'Approuvé'
                : topic.applicationStatus === 'rejected'
                ? 'Rejeté'
                : 'En attente'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

