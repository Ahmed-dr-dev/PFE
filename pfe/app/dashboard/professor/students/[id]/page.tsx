import Link from 'next/link'

async function getStudent(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/professor/students/${id}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data
  } catch (error) {
    return null
  }
}

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const data = await getStudent(params.id)
  
  if (!data) {
    return (
      <div className="space-y-8">
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-2xl">
          <p className="text-gray-400 text-lg">Étudiant non trouvé</p>
        </div>
      </div>
    )
  }
  
  const { student, topic, status, progress, startDate, lastMeeting, milestones } = data

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/professor/students"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux étudiants
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{student?.full_name || 'N/A'}</h1>
          <p className="text-gray-400 text-lg">Profil étudiant et suivi du PFE</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/professor/students/${student.id}/meetings`}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm"
          >
            Planifier une réunion
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Sujet de PFE</h2>
            {topic && (
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white mb-2">{topic.title}</h3>
                <p className="text-gray-300 leading-relaxed">{topic.description}</p>
              </div>
            )}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Progression</p>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-slate-700/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress || 0}%` }}
                    />
                  </div>
                  <span className="text-white font-semibold">{progress || 0}%</span>
                </div>
              </div>
            </div>
          </div>

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
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-2xl shadow-lg mb-4">
              {student?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'N/A'}
            </div>
            <h3 className="text-lg font-bold text-white mb-4">Informations</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                <p className="text-white font-medium text-sm">{student?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Téléphone</p>
                <p className="text-white font-medium text-sm">{student?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Département</p>
                <p className="text-white font-medium text-sm">{student?.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Année</p>
                <p className="text-white font-medium text-sm">{student?.year || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Statistiques</h3>
            <div className="space-y-4">
              {startDate && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Début du projet</p>
                  <p className="text-white font-semibold">{new Date(startDate).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
              {lastMeeting && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Dernière réunion</p>
                  <p className="text-white font-semibold">{new Date(lastMeeting).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


