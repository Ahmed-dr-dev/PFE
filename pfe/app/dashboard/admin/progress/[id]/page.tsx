import Link from 'next/link'

async function getProgress(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/progress/${id}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data
  } catch (error) {
    return null
  }
}

export default async function ProgressDetailPage({ params }: { params: { id: string } }) {
  const data = await getProgress(params.id)
  
  if (!data) {
    return (
      <div className="space-y-8">
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-2xl">
          <p className="text-gray-400 text-lg">PFE non trouvé</p>
        </div>
      </div>
    )
  }
  
  const pfe = data.pfe
  const project = pfe ? {
    id: pfe.id,
    status: pfe.status,
    progress: pfe.progress,
    start_date: pfe.startDate,
    updated_at: pfe.lastUpdate,
  } : null
  const student = pfe?.student || null
  const topic = pfe?.topic || null
  const supervisor = pfe?.supervisor ? { full_name: pfe.supervisor } : null
  const milestones = data.milestones || []

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
          {topic && (
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">Sujet de PFE</h2>
              <h3 className="text-xl font-semibold text-white mb-2">{topic.title}</h3>
              {topic.description && (
                <p className="text-gray-300 leading-relaxed mb-4">{topic.description}</p>
              )}
              {project && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Progression</p>
                    <div className="flex items-center gap-3">
                      <div className="w-48 bg-slate-700/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold">{project.progress || 0}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Jalons du projet</h2>
            <div className="space-y-4">
              {milestones && milestones.length > 0 ? milestones.map((milestone: any, index: number) => (
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
                    {milestone.completed_date && (
                      <p className="text-gray-500 text-xs">
                        Terminé le {new Date(milestone.completed_date).toLocaleDateString('fr-FR')}
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
              )) : (
                <p className="text-gray-400 text-sm text-center py-8">Aucun jalon défini</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Étudiant</h3>
            {student && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nom</p>
                  <p className="text-white font-medium text-sm">{student.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-white font-medium text-sm">{student.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Département</p>
                  <p className="text-white font-medium text-sm">{student.department || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>

          {supervisor && (
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Encadrant</h3>
              <p className="text-white font-medium">{supervisor.full_name || 'N/A'}</p>
            </div>
          )}

          {project && (
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Informations</h3>
              <div className="space-y-4">
                {project.start_date && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Début du projet</p>
                    <p className="text-white font-semibold">{new Date(project.start_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {project.updated_at && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Dernière mise à jour</p>
                    <p className="text-white font-semibold">{new Date(project.updated_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {project.status && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Statut</p>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      project.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50'
                        : project.status === 'in_progress'
                        ? 'bg-blue-500/20 text-blue-200 border-blue-500/50'
                        : 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50'
                    }`}>
                      {project.status === 'completed' ? 'Terminé' : project.status === 'in_progress' ? 'En cours' : 'En attente'}
                    </span>
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


