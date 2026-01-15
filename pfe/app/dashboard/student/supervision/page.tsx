'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function SupervisionPage() {
  const [data, setData] = useState<any>({ supervisor: null, meetings: [], documents: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSupervision() {
      try {
        const res = await fetch('/api/student/supervision', {
          cache: 'no-store',
        })
        if (!res.ok) return
        const result = await res.json()
        setData(result)
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    fetchSupervision()
  }, [])

  const supervisor = data.supervisor
  const meetings = data.meetings || []
  const documents = data.documents || []
  const pfeStatus = data.pfeStatus
  
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-2xl">
          <p className="text-gray-400 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!supervisor) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Mon <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Encadrement</span>
          </h1>
          <p className="text-gray-400 text-lg">Informations sur votre encadrant et suivi du projet</p>
        </div>
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-2xl">
          <p className="text-gray-400 text-lg">Aucun encadrant assigné pour le moment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
          Mon <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Encadrement</span>
        </h1>
        <p className="text-gray-400 text-lg">Informations sur votre encadrant et suivi du projet</p>
      </div>

      {pfeStatus === 'pending' && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-6 py-4 rounded-lg backdrop-blur-sm">
          <p className="font-medium">
            Votre affectation est en attente d'approbation par l'administrateur. Une fois approuvée, vous pourrez consulter les sujets disponibles.
          </p>
        </div>
      )}

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
                  {supervisor.expertise && supervisor.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {supervisor.expertise.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs font-medium text-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {supervisor.bio && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Biographie</p>
                    <p className="text-gray-300 leading-relaxed">{supervisor.bio}</p>
                  </div>
                )}

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
                  {supervisor.office && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bureau</p>
                      <p className="text-gray-300 font-medium">{supervisor.office}</p>
                    </div>
                  )}
                  {supervisor.office_hours && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Heures de disponibilité</p>
                      <p className="text-gray-300 font-medium">{supervisor.office_hours}</p>
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

