import Link from 'next/link'

export default function StudentsPage() {
  const students = [
    {
      id: '1',
      name: 'Abdelrahman Ali',
      email: 'abdelrahman.ali@student.isaeg.ma',
      topic: 'Système de gestion de bibliothèque',
      status: 'in_progress',
      progress: 65,
      lastMeeting: '2024-02-15',
    },
    {
      id: '2',
      name: 'Fatima Zahra',
      email: 'fatima.zahra@student.isaeg.ma',
      topic: 'Plateforme e-learning',
      status: 'in_progress',
      progress: 45,
      lastMeeting: '2024-02-10',
    },
    {
      id: '3',
      name: 'Mohamed Amine',
      email: 'mohamed.amine@student.isaeg.ma',
      topic: 'Plateforme e-learning',
      status: 'pending',
      progress: 0,
      lastMeeting: null,
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
            Mes <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">étudiants</span>
          </h1>
          <p className="text-gray-400 text-lg">Gérez et encadrez vos étudiants affectés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {students.map((student) => (
          <div
            key={student.id}
            className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl hover:border-emerald-500/50 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-white">{student.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border backdrop-blur-sm ${
                        statusColors[student.status] || statusColors.pending
                      }`}
                    >
                      {statusLabels[student.status]}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{student.email}</p>
                  <p className="text-gray-300 font-medium">{student.topic}</p>
                </div>
              </div>
            </div>

            {student.status === 'in_progress' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progression</span>
                  <span className="text-sm font-semibold text-white">{student.progress}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-700/50">
              {student.lastMeeting && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Dernière rencontre: {new Date(student.lastMeeting).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
              <div className="ml-auto flex items-center gap-2">
                <Link
                  href={`/dashboard/professor/students/${student.id}`}
                  className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold text-sm"
                >
                  Voir profil
                </Link>
                <Link
                  href={`/dashboard/professor/students/${student.id}/meetings`}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/50 text-emerald-200 rounded-lg hover:from-emerald-600/30 hover:to-cyan-600/30 transition-all duration-200 font-semibold text-sm"
                >
                  Planifier
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

