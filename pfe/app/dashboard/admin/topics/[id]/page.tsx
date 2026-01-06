import Link from 'next/link'

export default function TopicDetailPage({ params }: { params: { id: string } }) {
  const topic = {
    id: params.id,
    title: 'Système de gestion de bibliothèque',
    description: 'Développement d\'une application web pour la gestion d\'une bibliothèque avec authentification, recherche de livres, et système de prêt.',
    requirements: 'Connaissances en développement web (React, Node.js), bases de données (PostgreSQL), et authentification.',
    department: 'Informatique',
    professor: 'Prof. Ahmed Benali',
    status: 'pending',
    createdAt: '2024-02-10',
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/admin/topics"
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
          <span className="px-4 py-2 rounded-xl text-sm font-semibold border bg-yellow-500/20 text-yellow-200 border-yellow-500/50">
            En attente
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
        </div>

        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Informations</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Enseignant</p>
                <p className="text-white font-medium">{topic.professor}</p>
              </div>
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
                <p className="text-white font-medium">En attente de validation</p>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm">
                Approuver le sujet
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/50 text-red-200 rounded-lg hover:from-red-600/30 hover:to-red-700/30 transition-all duration-200 font-semibold text-sm">
                Rejeter le sujet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

