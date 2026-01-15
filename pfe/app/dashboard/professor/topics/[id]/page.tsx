import Link from 'next/link'
import { ApplicationActions } from './application-actions'

async function getTopic(id: string) {   
  try {
    const res = await fetch(`/api/professor/topics/${id}`, {
      cache: 'no-store',
    })
    console.log(res)
    if (!res.ok) return null
    const data = await res.json()
    return data.topic
  } catch (error) {
    return null
  }
}

export default async function TopicDetailPage({ params }: { params: { id: string } }) {
  const topic = await getTopic(params.id)
  
  if (!topic) {
    return (
      <div className="space-y-8">
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-2xl">
          <p className="text-gray-400 text-lg">Sujet non trouvé</p>
        </div>
      </div>
    )
  }
  
  const applications = topic.applications || []

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
          <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
            topic.status === 'approved' 
              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50'
              : topic.status === 'pending'
              ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50'
              : 'bg-gray-500/20 text-gray-200 border-gray-500/50'
          }`}>
            {topic.status === 'approved' ? 'Approuvé' : topic.status === 'pending' ? 'En attente' : 'Rejeté'}
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
              {applications.length > 0 ? applications.map((app: any) => (
                <div
                  key={app.id}
                  className="p-6 bg-slate-700/30 border border-slate-600/50 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{app.student?.full_name || 'N/A'}</h3>
                      <p className="text-gray-400 text-sm">{app.student?.email || 'N/A'}</p>
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
                    Soumis le {new Date(app.submitted_at).toLocaleDateString('fr-FR')}
                  </p>
                  {app.status === 'pending' && (
                    <ApplicationActions applicationId={app.id} topicId={topic.id} />
                  )}
                </div>
              )) : (
                <p className="text-gray-400 text-sm text-center py-8">Aucune demande d'affectation</p>
              )}
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
                <p className="text-white font-medium">{new Date(topic.created_at).toLocaleDateString('fr-FR')}</p>
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
                <p className="text-2xl font-bold text-white">{applications.length}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Affectés</p>
                <p className="text-2xl font-bold text-white">{Array.isArray(topic.projects) ? topic.projects.length : 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


