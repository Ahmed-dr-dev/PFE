'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [myPfe, setMyPfe] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMyPfe() {
      try {
        const res = await fetch('/api/student/my-pfe', {
          cache: 'no-store',
        })
        if (!res.ok) return
        const data = await res.json()
        setMyPfe(data.pfe)
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
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-2xl">
          <p className="text-gray-400 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!myPfe) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Bienvenue, <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Étudiant</span>
            </h1>
            <p className="text-gray-400 text-lg">Gérez votre Projet de Fin d'Études</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-2xl overflow-hidden max-w-2xl w-full">
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
              <h3 className="text-2xl font-bold text-white mb-3">Aucun PFE assigné</h3>
              <p className="text-gray-400 mb-4 text-lg">
                Un encadrant doit vous ajouter à sa supervision et l'administrateur doit approuver l'affectation avant que vous puissiez consulter les sujets disponibles.
              </p>
              <p className="text-gray-500 mb-8 text-sm">
                Contactez votre encadrant pour commencer.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Bienvenue, <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Étudiant</span>
          </h1>
          <p className="text-gray-400 text-lg">Gérez votre Projet de Fin d'Études</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-white">Votre PFE actuel</h2>
                <span
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border backdrop-blur-sm ${
                    statusColors[myPfe.status] || statusColors.pending
                  }`}
                >
                  {statusLabels[myPfe.status] || 'Inconnu'}
                </span>
              </div>
              
              <div className="flex-1 space-y-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sujet</p>
                  <p className="text-white font-bold text-2xl">{myPfe.topic?.title || 'N/A'}</p>
                </div>
                
                {myPfe.topic?.description && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                    <p className="text-gray-300 leading-relaxed text-lg">{myPfe.topic.description}</p>
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

                <div className="mt-auto pt-6">
                  <Link
                    href="/dashboard/student/my-pfe"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5"
                  >
                    Voir les détails
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {myPfe.supervisor && (
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Encadrant
              </h3>
              <div className="space-y-3">
                <p className="text-white font-semibold">{myPfe.supervisor.full_name}</p>
                {myPfe.supervisor.email && (
                  <a
                    href={`mailto:${myPfe.supervisor.email}`}
                    className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors block"
                  >
                    {myPfe.supervisor.email}
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              Actions rapides
            </h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/student/topics"
                className="block px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-sm font-medium text-white transition-all"
              >
                Sujets disponibles
              </Link>
              <Link
                href="/dashboard/student/supervision"
                className="block px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-sm font-medium text-white transition-all"
              >
                Mon encadrement
              </Link>
              <Link
                href="/dashboard/student/documents"
                className="block px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-sm font-medium text-white transition-all"
              >
                Documents
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
