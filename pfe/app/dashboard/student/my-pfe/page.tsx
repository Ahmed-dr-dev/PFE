'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function MyPfePage() {
  const [myPfe, setMyPfe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    async function fetchMyPfe() {
      try {
        const res = await fetch('/api/student/my-pfe', {
          cache: 'no-store',
        })
        if (!res.ok) return
        const data = await res.json()
        setMyPfe(data.pfe)
        if (!data.pfe) {
          setShowModal(true)
        }
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    fetchMyPfe()
  }, [])

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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-2xl">
          <p className="text-gray-400 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
      <>
      {showModal && !myPfe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl max-w-md w-full">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/30">
                <svg
                  className="w-10 h-10 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Aucun PFE approuvé
              </h3>
              <p className="text-gray-400 mb-6 text-base leading-relaxed">
                Vous n'avez pas encore de sujet de PFE approuvé par votre encadrant. 
                Consultez les sujets disponibles et postulez pour en obtenir un.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard/student/topics"
                  onClick={() => setShowModal(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:shadow-emerald-500/25"
                >
                  Voir les sujets disponibles
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-slate-700/50 text-gray-300 rounded-xl hover:bg-slate-700 transition-all duration-200 font-semibold border border-slate-600/50"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Mon <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">PFE</span>
          </h1>
          <p className="text-gray-400 text-lg">Suivez l'état de votre projet</p>
        </div>

        {!myPfe ? (
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
                href="/dashboard/student/topics"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5"
              >
                Voir les sujets disponibles
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
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
                    {myPfe.topic?.title || 'N/A'}
                  </p>
                </div>

                {myPfe.topic?.description && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{myPfe.topic.description}</p>
                  </div>
                )}

                {myPfe.topic?.requirements && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Prérequis et compétences</p>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{myPfe.topic.requirements}</p>
                  </div>
                )}

                {myPfe.progress !== undefined && myPfe.progress !== null && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progression</p>
                      <span className="text-sm font-semibold text-white">{myPfe.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${myPfe.progress || 0}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                  {myPfe.start_date && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date de début</p>
                      <p className="text-gray-300 font-medium">
                        {new Date(myPfe.start_date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                {myPfe.supervisor.office && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bureau</p>
                    <p className="text-gray-300 font-medium text-sm">{myPfe.supervisor.office}</p>
                  </div>
                )}
                {myPfe.supervisor.office_hours && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Heures de bureau</p>
                    <p className="text-gray-300 font-medium text-sm">{myPfe.supervisor.office_hours}</p>
                  </div>
                )}
                {myPfe.supervisor.bio && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Biographie</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{myPfe.supervisor.bio}</p>
                  </div>
                )}
                {myPfe.supervisor.expertise && Array.isArray(myPfe.supervisor.expertise) && myPfe.supervisor.expertise.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Domaines d'expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {myPfe.supervisor.expertise.map((exp: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 rounded-lg text-xs font-semibold"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
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
        )}
      </div>
    </>
  )
}
