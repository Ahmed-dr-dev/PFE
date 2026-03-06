'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function SupervisionPage() {
  const [data, setData] = useState<any>({ supervisor: null, meetings: [], documents: [] })
  const [loading, setLoading] = useState(true)
  const [professors, setProfessors] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [requestLoading, setRequestLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchSupervision() {
      try {
        const res = await fetch('/api/student/supervision', { cache: 'no-store' })
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

  useEffect(() => {
    if (data.supervisor) return
    async function fetchProfessorsAndRequests() {
      try {
        const [profRes, reqRes] = await Promise.all([
          fetch('/api/student/professors'),
          fetch('/api/student/supervision-requests'),
        ])
        if (profRes.ok) {
          const j = await profRes.json()
          setProfessors(j.professors || [])
        }
        if (reqRes.ok) {
          const j = await reqRes.json()
          setRequests(j.requests || [])
        }
      } catch (e) {
        console.error(e)
      }
    }
    if (!loading && !data.supervisor) fetchProfessorsAndRequests()
  }, [loading, data.supervisor])

  const supervisor = data.supervisor
  const meetings = data.meetings || []
  const documents = data.documents || []
  const pfeStatus = data.pfeStatus
  const defense = data.defense

  const requestedProfessorIds = new Set(requests.map((r: any) => r.professor_id))
  const pendingRequest = requests.find((r: any) => r.status === 'pending')

  async function sendRequest(professorId: string) {
    setError('')
    setRequestLoading(professorId)
    try {
      const res = await fetch('/api/student/supervision-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professorId }),
      })
      const j = await res.json()
      if (!res.ok) {
        setError(j.error || 'Erreur')
        return
      }
      const prof = professors.find((p: any) => p.id === professorId)
      setRequests(prev => [{ ...j.request, professor: prof || {} }, ...prev])
    } finally {
      setRequestLoading(null)
    }
  }
  
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-2xl">
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!supervisor) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Mon <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Encadrement</span>
          </h1>
          <p className="text-gray-600 text-lg">Demandez à un encadrant de vous superviser. Il pourra accepter ou refuser votre demande.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {requests.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mes demandes</h2>
            <ul className="space-y-3">
              {requests.map((r: any) => (
                <li key={r.id} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">{r.professor?.full_name || 'Encadrant'}</p>
                    <p className="text-sm text-gray-600">{r.professor?.department}</p>
                  </div>
                  <span className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold ${
                    r.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    r.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {r.status === 'pending' ? 'En attente' : r.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                  </span>
                </li>
              ))}
            </ul>
            {pendingRequest && (
              <p className="mt-3 text-sm text-gray-600">Une fois votre demande acceptée, actualisez la page pour voir votre encadrant.</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Demander un encadrement</h2>
          <p className="text-gray-600 text-sm mb-4">Choisissez un encadrant et envoyez-lui une demande. Il pourra accepter ou refuser.</p>
          {pendingRequest ? (
            <p className="text-amber-700 text-sm">Vous avez déjà une demande en attente. Vous pourrez en envoyer une autre si elle est refusée.</p>
          ) : (
            <ul className="space-y-3">
              {professors.map((p: any) => {
                const alreadyRequested = requestedProfessorIds.has(p.id)
                const accepted = requests.some((r: any) => r.professor_id === p.id && r.status === 'accepted')
                return (
                  <li key={p.id} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-900">{p.full_name}</p>
                      <p className="text-sm text-gray-600">{p.department} · {p.email}</p>
                      {p.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.bio}</p>}
                    </div>
                    <button
                      type="button"
                      disabled={alreadyRequested || accepted || requestLoading !== null}
                      onClick={() => sendRequest(p.id)}
                      className="shrink-0 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {requestLoading === p.id ? 'Envoi...' : alreadyRequested ? 'Demandé' : accepted ? 'Accepté' : 'Demander'}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          {professors.length === 0 && !pendingRequest && (
            <p className="text-gray-500 text-sm">Aucun encadrant disponible pour le moment.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
          Mon <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Encadrement</span>
        </h1>
        <p className="text-gray-600 text-lg">Informations sur votre encadrant et suivi du projet</p>
      </div>

      {pfeStatus === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
          <p className="font-medium">
            Votre affectation est en attente d'approbation par l'administrateur. Une fois approuvée, vous pourrez consulter les sujets disponibles.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30 shadow-lg">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{supervisor.full_name}</h2>
                  <p className="text-gray-600 capitalize mb-4">{supervisor.department}</p>
                  {supervisor.expertise && supervisor.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {supervisor.expertise.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
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
                    <p className="text-gray-700 leading-relaxed">{supervisor.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
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
                      <p className="text-gray-700 font-medium">{supervisor.office}</p>
                    </div>
                  )}
                  {supervisor.office_hours && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Heures de disponibilité</p>
                      <p className="text-gray-700 font-medium">{supervisor.office_hours}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

         
        </div>

        <div className="space-y-6">
          {defense && (
            <div className="relative bg-white rounded-2xl border border-emerald-500/30 p-6 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/30">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Ma soutenance
              </h2>
              <div className="space-y-2 text-gray-700">
                <p><span className="text-gray-600">Date :</span> {new Date(defense.scheduled_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                {defense.scheduled_time && <p><span className="text-gray-600">Heure :</span> {String(defense.scheduled_time).slice(0, 5)}</p>}
                {defense.room && <p><span className="text-gray-600">Salle :</span> {defense.room}</p>}
                {defense.jury_members?.length > 0 && <p><span className="text-gray-600">Jury :</span> {defense.jury_members.join(', ')}</p>}
              </div>
            </div>
          )}

          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
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
                className="flex items-center gap-3 p-4 bg-gray-100 border border-gray-200 rounded-xl hover:border-emerald-200 hover:bg-gray-100 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-500/30">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-semibold text-sm">Envoyer un email</p>
                  <p className="text-gray-600 text-xs">{supervisor.email}</p>
                </div>
              </a>
              <a
                href={`tel:${supervisor.phone}`}
                className="flex items-center gap-3 p-4 bg-gray-100 border border-gray-200 rounded-xl hover:border-emerald-200 hover:bg-gray-100 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-500/30">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-semibold text-sm">Appeler</p>
                  <p className="text-gray-600 text-xs">{supervisor.phone}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

