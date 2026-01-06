import Link from 'next/link'

export default function ProgressPage() {
  const pfeList = [
    {
      id: '1',
      student: 'Abdelrahman Ali',
      topic: 'Système de gestion de bibliothèque',
      supervisor: 'Prof. Ahmed Benali',
      progress: 65,
      status: 'in_progress',
      lastUpdate: '2024-02-20',
    },
    {
      id: '2',
      student: 'Fatima Zahra',
      topic: 'Plateforme e-learning',
      supervisor: 'Prof. Fatima Zahra',
      progress: 45,
      status: 'in_progress',
      lastUpdate: '2024-02-18',
    },
    {
      id: '3',
      student: 'Mohamed Amine',
      topic: 'Application mobile de gestion de tâches',
      supervisor: 'Prof. Mohamed Amine',
      progress: 100,
      status: 'completed',
      lastUpdate: '2024-02-15',
    },
  ]

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50',
    in_progress: 'bg-blue-500/20 text-blue-200 border-blue-500/50',
    completed: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50',
  }

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    in_progress: 'En cours',
    completed: 'Terminé',
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Suivi des <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">PFE</span>
          </h1>
          <p className="text-gray-400 text-lg">Suivez l'état d'avancement de tous les PFE</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pfeList.map((pfe) => (
          <div
            key={pfe.id}
            className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl hover:border-emerald-500/50 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{pfe.topic}</h3>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border backdrop-blur-sm ${
                      statusColors[pfe.status] || statusColors.pending
                    }`}
                  >
                    {statusLabels[pfe.status]}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>{pfe.student}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{pfe.supervisor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Dernière mise à jour: {new Date(pfe.lastUpdate).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                {pfe.status === 'in_progress' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progression</span>
                      <span className="text-sm font-semibold text-white">{pfe.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pfe.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <Link
                href={`/dashboard/admin/progress/${pfe.id}`}
                className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold text-sm"
              >
                Voir détails
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

