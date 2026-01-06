import Link from 'next/link'

export default function ProgressDetailPage({ params }: { params: { id: string } }) {
  const pfe = {
    id: params.id,
    student: {
      name: 'Abdelrahman Ali',
      email: 'abdelrahman.ali@student.isaeg.ma',
      department: 'Informatique',
    },
    topic: {
      title: 'Système de gestion de bibliothèque',
      description: 'Développement d\'une application web pour la gestion d\'une bibliothèque avec authentification, recherche de livres, et système de prêt.',
    },
    supervisor: 'Prof. Ahmed Benali',
    progress: 65,
    status: 'in_progress',
    startDate: '2024-01-20',
    lastUpdate: '2024-02-20',
  }

  const milestones = [
    { id: '1', title: 'Cahier des charges', status: 'completed', date: '2024-01-25' },
    { id: '2', title: 'Architecture du système', status: 'completed', date: '2024-02-05' },
    { id: '3', title: 'Développement backend', status: 'in_progress', date: null },
    { id: '4', title: 'Développement frontend', status: 'pending', date: null },
    { id: '5', title: 'Tests et déploiement', status: 'pending', date: null },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/admin/progress"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au suivi
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Suivi <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">PFE</span>
          </h1>
          <p className="text-gray-400 text-lg">Détails du projet et progression</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Sujet de PFE</h2>
            <h3 className="text-xl font-semibold text-white mb-2">{pfe.topic.title}</h3>
            <p className="text-gray-300 leading-relaxed mb-4">{pfe.topic.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Progression</p>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-slate-700/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${pfe.progress}%` }}
                    />
                  </div>
                  <span className="text-white font-semibold">{pfe.progress}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Jalons du projet</h2>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="flex items-start gap-4 p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    milestone.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : milestone.status === 'in_progress'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                      : 'bg-slate-700/50 text-gray-500 border border-slate-600/50'
                  }`}>
                    {milestone.status === 'completed' ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{milestone.title}</h3>
                    {milestone.date && (
                      <p className="text-gray-500 text-xs">
                        Terminé le {new Date(milestone.date).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                    milestone.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50'
                      : milestone.status === 'in_progress'
                      ? 'bg-blue-500/20 text-blue-200 border-blue-500/50'
                      : 'bg-slate-700/50 text-gray-400 border border-slate-600/50'
                  }`}>
                    {milestone.status === 'completed' ? 'Terminé' : milestone.status === 'in_progress' ? 'En cours' : 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Étudiant</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nom</p>
                <p className="text-white font-medium text-sm">{pfe.student.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                <p className="text-white font-medium text-sm">{pfe.student.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Département</p>
                <p className="text-white font-medium text-sm">{pfe.student.department}</p>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Encadrant</h3>
            <p className="text-white font-medium">{pfe.supervisor}</p>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Informations</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Début du projet</p>
                <p className="text-white font-semibold">{new Date(pfe.startDate).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Dernière mise à jour</p>
                <p className="text-white font-semibold">{new Date(pfe.lastUpdate).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Statut</p>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold border bg-blue-500/20 text-blue-200 border-blue-500/50">
                  En cours
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

