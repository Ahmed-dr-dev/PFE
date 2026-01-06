import Link from 'next/link'

export default function MyPfePage() {
  const myPfe = {
    id: '1',
    status: 'in_progress',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-20T14:30:00Z',
    pfe_topics: {
      title: 'Système de gestion de bibliothèque',
      description: 'Développement d\'une application web pour la gestion d\'une bibliothèque avec authentification, recherche de livres, et système de prêt.',
    },
    supervisor: {
      id: '1',
      full_name: 'Prof. Ahmed Benali',
      email: 'ahmed.benali@isaeg.ma',
      phone: '+212 6XX XXX XXX',
      department: 'informatique',
    },
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50',
    approved: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50',
    rejected: 'bg-red-500/20 text-red-200 border-red-500/50',
    in_progress: 'bg-blue-500/20 text-blue-200 border-blue-500/50',
    completed: 'bg-purple-500/20 text-purple-200 border-purple-500/50',
  }

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    in_progress: 'En cours',
    completed: 'Terminé',
  }

  if (!myPfe) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Mon <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">PFE</span>
          </h1>
          <p className="text-gray-400 text-lg">Suivez l'état de votre projet</p>
        </div>

        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5" />
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
              <svg
                className="w-12 h-12 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Aucun PFE assigné
            </h3>
            <p className="text-gray-400 mb-8 text-lg">
              Consultez les sujets disponibles et choisissez-en un pour commencer.
            </p>
            <Link
              href="/dashboard/topics"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5"
            >
              Voir les sujets disponibles
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
          Mon <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">PFE</span>
        </h1>
        <p className="text-gray-400 text-lg">Suivez l'état de votre projet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <h2 className="text-2xl font-bold text-white">Informations du projet</h2>
                <span
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border backdrop-blur-sm ${
                    statusColors[myPfe.status] || statusColors.pending
                  }`}
                >
                  {statusLabels[myPfe.status] || 'Inconnu'}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Titre du sujet</p>
                  <p className="text-white font-bold text-xl leading-tight">
                    {myPfe.pfe_topics?.title || 'N/A'}
                  </p>
                </div>

                {myPfe.pfe_topics?.description && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                    <p className="text-gray-300 leading-relaxed">{myPfe.pfe_topics.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                  {myPfe.created_at && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date de soumission</p>
                      <p className="text-gray-300 font-medium">
                        {new Date(myPfe.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}

                  {myPfe.updated_at && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dernière mise à jour</p>
                      <p className="text-gray-300 font-medium">
                        {new Date(myPfe.updated_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              Encadrement
            </h2>
            {myPfe.supervisor ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Encadrant</p>
                  <p className="text-white font-semibold text-lg">{myPfe.supervisor.full_name}</p>
                </div>
                {myPfe.supervisor.email && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</p>
                    <a
                      href={`mailto:${myPfe.supervisor.email}`}
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors inline-flex items-center gap-1"
                    >
                      {myPfe.supervisor.email}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
                {myPfe.supervisor.phone && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Téléphone</p>
                    <a
                      href={`tel:${myPfe.supervisor.phone}`}
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors inline-flex items-center gap-1"
                    >
                      {myPfe.supervisor.phone}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                  </div>
                )}
                {myPfe.supervisor.department && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Département</p>
                    <p className="text-gray-300 capitalize font-medium">{myPfe.supervisor.department}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Aucun encadrant assigné pour le moment</p>
            )}
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              État du projet
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/50">
                <div
                  className={`w-3 h-3 rounded-full ${
                    myPfe.status === 'pending' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' : 'bg-slate-600'
                  }`}
                />
                <span className="text-sm text-gray-300 font-medium">En attente</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/50">
                <div
                  className={`w-3 h-3 rounded-full ${
                    myPfe.status === 'approved' ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-slate-600'
                  }`}
                />
                <span className="text-sm text-gray-300 font-medium">Approuvé</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/50">
                <div
                  className={`w-3 h-3 rounded-full ${
                    myPfe.status === 'in_progress' ? 'bg-blue-400 shadow-lg shadow-blue-400/50' : 'bg-slate-600'
                  }`}
                />
                <span className="text-sm text-gray-300 font-medium">En cours</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/50">
                <div
                  className={`w-3 h-3 rounded-full ${
                    myPfe.status === 'completed' ? 'bg-purple-400 shadow-lg shadow-purple-400/50' : 'bg-slate-600'
                  }`}
                />
                <span className="text-sm text-gray-300 font-medium">Terminé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
