import Link from 'next/link'

export default function TopicDetailPage({ params }: { params: { id: string } }) {
  const topic = {
    id: params.id,
    title: 'Système de gestion de bibliothèque',
    description: 'Développement d\'une application web pour la gestion d\'une bibliothèque avec authentification, recherche de livres, et système de prêt.',
    requirements: 'Connaissances en développement web (React, Node.js), bases de données (PostgreSQL), et authentification.',
    department: 'Informatique',
    status: 'active',
    createdAt: '2024-01-15',
    applications: [
      {
        id: '1',
        student: 'Abdelrahman Ali',
        email: 'abdelrahman.ali@student.isaeg.ma',
        submittedAt: '2024-02-10',
        status: 'approved',
      },
      {
        id: '2',
        student: 'Fatima Zahra',
        email: 'fatima.zahra@student.isaeg.ma',
        submittedAt: '2024-02-12',
        status: 'pending',
      },
    ],
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/professor/topics"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux sujets
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{topic.title}</h1>
          <p className="text-gray-400 text-lg">Détails du sujet de PFE</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-xl text-sm font-semibold border bg-emerald-500/20 text-emerald-200 border-emerald-500/50">
            Actif
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
            <p className="text-gray-300 leading-relaxed">{topic.description}</p>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Prérequis</h2>
            <p className="text-gray-300 leading-relaxed">{topic.requirements}</p>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Demandes d'affectation</h2>
            <div className="space-y-4">
              {topic.applications.map((app) => (
                <div
                  key={app.id}
                  className="p-6 bg-slate-700/30 border border-slate-600/50 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{app.student}</h3>
                      <p className="text-gray-400 text-sm">{app.email}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                        app.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50'
                          : 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50'
                      }`}
                    >
                      {app.status === 'approved' ? 'Approuvé' : 'En attente'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Soumis le {new Date(app.submittedAt).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm">
                      Approuver
                    </button>
                    <button className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold text-sm">
                      Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Informations</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Département</p>
                <p className="text-white font-medium">{topic.department}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Créé le</p>
                <p className="text-white font-medium">{new Date(topic.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Statut</p>
                <p className="text-white font-medium">Actif</p>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Demandes</p>
                <p className="text-2xl font-bold text-white">{topic.applications.length}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Affectés</p>
                <p className="text-2xl font-bold text-white">{topic.applications.filter(a => a.status === 'approved').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


