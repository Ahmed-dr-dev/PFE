import Link from 'next/link'

export default function SupervisionPage() {
  const supervisor = {
    id: '1',
    full_name: 'Prof. Ahmed Benali',
    email: 'ahmed.benali@isaeg.ma',
    phone: '+212 6XX XXX XXX',
    department: 'informatique',
    office: 'Bureau 205, Bâtiment A',
    office_hours: 'Lundi - Vendredi: 14h00 - 17h00',
    bio: 'Professeur en informatique avec plus de 15 ans d\'expérience dans le développement web et les systèmes distribués. Spécialisé en architecture logicielle et bases de données.',
    expertise: ['Développement Web', 'Bases de données', 'Architecture logicielle', 'Systèmes distribués'],
  }

  const meetings = [
    {
      id: '1',
      date: '2024-03-15',
      time: '14:00',
      type: 'Suivi',
      status: 'planned',
      notes: 'Discussion sur l\'avancement du projet et les prochaines étapes',
    },
    {
      id: '2',
      date: '2024-03-01',
      time: '15:30',
      type: 'Révision',
      status: 'completed',
      notes: 'Révision du code et validation de l\'architecture',
    },
    {
      id: '3',
      date: '2024-02-15',
      time: '14:00',
      type: 'Kick-off',
      status: 'completed',
      notes: 'Première réunion de lancement du projet',
    },
  ]

  const documents = [
    {
      id: '1',
      name: 'Cahier des charges',
      type: 'PDF',
      size: '2.4 MB',
      uploaded_at: '2024-01-20',
      uploaded_by: 'Prof. Ahmed Benali',
    },
    {
      id: '2',
      name: 'Guide de développement',
      type: 'PDF',
      size: '1.8 MB',
      uploaded_at: '2024-02-01',
      uploaded_by: 'Prof. Ahmed Benali',
    },
    {
      id: '3',
      name: 'Rapport d\'avancement - Février',
      type: 'DOCX',
      size: '456 KB',
      uploaded_at: '2024-02-28',
      uploaded_by: 'Vous',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
          Mon <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Encadrement</span>
        </h1>
        <p className="text-gray-400 text-lg">Informations sur votre encadrant et suivi du projet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30 shadow-lg">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{supervisor.full_name}</h2>
                  <p className="text-gray-400 capitalize mb-4">{supervisor.department}</p>
                  <div className="flex flex-wrap gap-2">
                    {supervisor.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs font-medium text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Biographie</p>
                  <p className="text-gray-300 leading-relaxed">{supervisor.bio}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</p>
                    <a
                      href={`mailto:${supervisor.email}`}
                      className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-2 transition-colors"
                    >
                      {supervisor.email}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Téléphone</p>
                    <a
                      href={`tel:${supervisor.phone}`}
                      className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-2 transition-colors"
                    >
                      {supervisor.phone}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bureau</p>
                    <p className="text-gray-300 font-medium">{supervisor.office}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Heures de disponibilité</p>
                    <p className="text-gray-300 font-medium">{supervisor.office_hours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              Réunions de suivi
            </h2>
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-6 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-emerald-500/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-semibold text-emerald-300">
                          {meeting.type}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            meeting.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}
                        >
                          {meeting.status === 'completed' ? 'Terminée' : 'Planifiée'}
                        </span>
                      </div>
                      <p className="text-white font-semibold text-lg">
                        {new Date(meeting.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">{meeting.time}</p>
                    </div>
                  </div>
                  {meeting.notes && (
                    <p className="text-gray-300 text-sm leading-relaxed">{meeting.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/30">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Documents partagés
            </h2>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-emerald-500/50 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-600/50 flex items-center justify-center border border-slate-500/50 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-colors">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{doc.type}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{doc.size}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Par {doc.uploaded_by} • {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-slate-600/50 transition-colors">
                      <svg className="w-5 h-5 text-gray-400 hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              Contact rapide
            </h2>
            <div className="space-y-3">
              <a
                href={`mailto:${supervisor.email}`}
                className="flex items-center gap-3 p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-emerald-500/50 hover:bg-slate-700/50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-500/30">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">Envoyer un email</p>
                  <p className="text-gray-400 text-xs">{supervisor.email}</p>
                </div>
              </a>
              <a
                href={`tel:${supervisor.phone}`}
                className="flex items-center gap-3 p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-emerald-500/50 hover:bg-slate-700/50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-500/30">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">Appeler</p>
                  <p className="text-gray-400 text-xs">{supervisor.phone}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

