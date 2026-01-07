import Link from 'next/link'

export default function TopicsPage() {
  const topics = [
    {
      id: '1',
      title: 'Système de gestion de bibliothèque',
      description: 'Développement d\'une application web pour la gestion d\'une bibliothèque avec authentification, recherche de livres, et système de prêt.',
      status: 'active',
      applications: 3,
      assigned: 1,
    },
    {
      id: '2',
      title: 'Plateforme e-learning',
      description: 'Création d\'une plateforme d\'apprentissage en ligne avec suivi des progrès et évaluations.',
      status: 'active',
      applications: 5,
      assigned: 2,
    },
    {
      id: '3',
      title: 'Application mobile de gestion de tâches',
      description: 'Développement d\'une application mobile cross-platform pour la gestion de tâches avec synchronisation cloud.',
      status: 'draft',
      applications: 0,
      assigned: 0,
    },
  ]

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50',
    draft: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50',
    archived: 'bg-gray-500/20 text-gray-200 border-gray-500/50',
  }

  const statusLabels: Record<string, string> = {
    active: 'Actif',
    draft: 'Brouillon',
    archived: 'Archivé',
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Mes <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">sujets</span>
          </h1>
          <p className="text-gray-400 text-lg">Gérez tous vos sujets de PFE proposés</p>
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

      <div className="grid grid-cols-1 gap-6">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl hover:border-emerald-500/50 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{topic.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border backdrop-blur-sm ${
                      statusColors[topic.status] || statusColors.draft
                    }`}
                  >
                    {statusLabels[topic.status]}
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed">{topic.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{topic.applications} demandes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{topic.assigned} affecté(s)</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Link
                  href={`/dashboard/professor/topics/${topic.id}`}
                  className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold text-sm"
                >
                  Voir détails
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


