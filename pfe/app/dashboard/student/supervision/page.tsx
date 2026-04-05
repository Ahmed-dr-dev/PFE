'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type TopicMode = 'none' | 'existing' | 'suggest'

export default function SupervisionPage() {
  const [data, setData] = useState<any>({ supervisor: null, meetings: [], documents: [] })
  const [loading, setLoading] = useState(true)
  const [professors, setProfessors] = useState<any[]>([])
  const [approvedTopics, setApprovedTopics] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [demandSubmitting, setDemandSubmitting] = useState(false)
  const [cancelLoading, setCancelLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [demandProfessorId, setDemandProfessorId] = useState<string | null>(null)
  const [topicMode, setTopicMode] = useState<TopicMode>('none')
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [suggestedTitle, setSuggestedTitle] = useState('')
  const [requestMessage, setRequestMessage] = useState('')

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
        const [profRes, reqRes, topicsRes] = await Promise.all([
          fetch('/api/student/professors'),
          fetch('/api/student/supervision-requests'),
          fetch('/api/student/topics', { cache: 'no-store' }),
        ])
        if (profRes.ok) {
          const j = await profRes.json()
          setProfessors(j.professors || [])
        }
        if (reqRes.ok) {
          const j = await reqRes.json()
          setRequests(j.requests || [])
        }
        if (topicsRes.ok) {
          const j = await topicsRes.json()
          setApprovedTopics(j.topics || [])
        }
      } catch (e) {
        console.error(e)
      }
    }
    if (!loading && !data.supervisor) fetchProfessorsAndRequests()
  }, [loading, data.supervisor])

  const topicsForSelectedProfessor = useMemo(() => {
    if (!demandProfessorId) return []
    return approvedTopics.filter((t: any) => {
      const prof = Array.isArray(t.professor) ? t.professor[0] : t.professor
      return prof?.id === demandProfessorId
    })
  }, [approvedTopics, demandProfessorId])

  const supervisor = data.supervisor
  const meetings = data.meetings || []
  const documents = data.documents || []
  const pfeStatus = data.pfeStatus
  const defense = data.defense

  function requestForProfessor(professorId: string) {
    return requests.find((r: any) => r.professor_id === professorId)
  }

  async function refreshRequests() {
    try {
      const reqRes = await fetch('/api/student/supervision-requests', { cache: 'no-store' })
      if (reqRes.ok) {
        const j = await reqRes.json()
        setRequests(j.requests || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  function openDemandModal(professorId: string) {
    setError('')
    setDemandProfessorId(professorId)
    setTopicMode('none')
    setSelectedTopicId('')
    setSuggestedTitle('')
    setRequestMessage('')
  }

  function closeDemandModal() {
    if (demandSubmitting) return
    setDemandProfessorId(null)
  }

  async function submitDemandRequest() {
    if (!demandProfessorId) return
    setError('')
    if (topicMode === 'existing') {
      if (!selectedTopicId) {
        setError('Sélectionnez un sujet du catalogue de cet encadrant ou choisissez une autre option.')
        return
      }
    }
    if (topicMode === 'suggest' && !suggestedTitle.trim()) {
      setError('Saisissez un titre de sujet ou choisissez une autre option.')
      return
    }
    setDemandSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        professorId: demandProfessorId,
        message: requestMessage.trim() || null,
      }
      if (topicMode === 'existing' && selectedTopicId) {
        body.preferredTopicId = selectedTopicId
      }
      if (topicMode === 'suggest' && suggestedTitle.trim()) {
        body.suggestedTopicTitle = suggestedTitle.trim()
      }
      const res = await fetch('/api/student/supervision-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = await res.json()
      if (!res.ok) {
        setError(j.error || 'Erreur')
        return
      }
      await refreshRequests()
      setDemandProfessorId(null)
    } finally {
      setDemandSubmitting(false)
    }
  }

  const demandProfessor = demandProfessorId
    ? professors.find((p: any) => p.id === demandProfessorId)
    : null

  async function cancelRequest(requestId: string) {
    if (!confirm('Annuler cette demande d’encadrement ?')) return
    setError('')
    setCancelLoading(requestId)
    try {
      const res = await fetch(`/api/student/supervision-requests/${requestId}`, {
        method: 'DELETE',
      })
      const j = await res.json()
      if (!res.ok) {
        setError(j.error || 'Erreur')
        return
      }
      setRequests((prev) => prev.filter((r: any) => r.id !== requestId))
    } finally {
      setCancelLoading(null)
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
          <p className="text-gray-600 text-lg">
            Vous pouvez envoyer des demandes à plusieurs encadrants. Dès qu&apos;un accepte, les autres demandes sont annulées automatiquement.
          </p>
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
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{r.professor?.full_name || 'Encadrant'}</p>
                      {(r.preferred_topic_id || r.suggested_topic_title) && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-violet-100 text-violet-800 border border-violet-200">
                          Demande de sujet
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{r.professor?.department}</p>
                    {r.topic?.title && (
                      <p className="text-xs text-emerald-800 font-medium mt-1 truncate">Sujet catalogue : {r.topic.title}</p>
                    )}
                    {r.suggested_topic_title && (
                      <p className="text-xs text-cyan-800 font-medium mt-1 truncate">
                        Proposition : {r.suggested_topic_title}
                      </p>
                    )}
                    {r.message && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">&quot;{r.message}&quot;</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      r.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      r.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {r.status === 'pending' ? 'En attente' : r.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                    </span>
                    {r.status === 'pending' && (
                      <button
                        type="button"
                        disabled={cancelLoading !== null}
                        onClick={() => cancelRequest(r.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-50"
                      >
                        {cancelLoading === r.id ? 'Annulation...' : 'Annuler la demande'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {requests.some((r: any) => r.status === 'pending') && (
              <p className="mt-3 text-sm text-gray-600">
                Dès qu&apos;un encadrant accepte, actualisez la page pour voir votre affectation. Les autres demandes seront supprimées.
              </p>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Demander un encadrement</h2>
          <p className="text-gray-600 text-sm mb-4">
            Envoyez une demande à chaque encadrant souhaité. Vous pouvez cumuler plusieurs demandes en attente auprès de personnes différentes.
          </p>
          <ul className="space-y-3">
            {professors.map((p: any) => {
              const r = requestForProfessor(p.id)
              const pending = r?.status === 'pending'
              const accepted = r?.status === 'accepted'
              const rejected = r?.status === 'rejected'
              const label = pending ? 'En attente' : accepted ? 'Accepté' : rejected ? 'Redemander' : 'Demander'
              return (
                <li key={p.id} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">{p.full_name}</p>
                    <p className="text-sm text-gray-600">{p.department} · {p.email}</p>
                    {p.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.bio}</p>}
                  </div>
                  <button
                    type="button"
                    disabled={pending || accepted || demandSubmitting}
                    onClick={() => openDemandModal(p.id)}
                    className="shrink-0 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {label}
                  </button>
                </li>
              )
            })}
          </ul>
          {professors.length === 0 && (
            <p className="text-gray-500 text-sm">Aucun encadrant disponible pour le moment.</p>
          )}
        </div>

        {demandProfessor && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <button
              type="button"
              aria-label="Fermer"
              className="absolute inset-0 bg-black/50"
              onClick={closeDemandModal}
            />
            <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl border border-gray-200 shadow-2xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 pr-8">Demande d&apos;encadrement</h3>
              <p className="text-sm text-gray-600 mt-1 mb-6">
                {demandProfessor.full_name} — {demandProfessor.department}
              </p>

              <p className="text-sm font-semibold text-gray-800 mb-1">Sujet de PFE</p>
              <p className="text-xs text-gray-500 mb-3">
                Si vous choisissez ou proposez un sujet, la demande est une <strong>demande de sujet</strong> : en cas
                d&apos;acceptation, ce sujet sera lié à votre projet PFE avec cet encadrant.
              </p>
              <div className="space-y-2 mb-4">
                <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 p-3 has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50/50">
                  <input
                    type="radio"
                    name="topicMode"
                    className="mt-1"
                    checked={topicMode === 'none'}
                    onChange={() => {
                      setTopicMode('none')
                      setSelectedTopicId('')
                      setSuggestedTitle('')
                    }}
                  />
                  <span className="text-sm text-gray-800">
                    <span className="font-medium">Sans préciser le sujet</span>
                    <span className="block text-gray-500 text-xs mt-0.5">Encadrement seul ; le sujet pourra être défini plus tard.</span>
                  </span>
                </label>
                <label
                  className={`flex items-start gap-3 rounded-xl border border-gray-200 p-3 has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50/50 ${
                    topicsForSelectedProfessor.length === 0 ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    name="topicMode"
                    className="mt-1"
                    disabled={topicsForSelectedProfessor.length === 0}
                    checked={topicMode === 'existing'}
                    onChange={() => {
                      setTopicMode('existing')
                      setSuggestedTitle('')
                    }}
                  />
                  <span className="text-sm text-gray-800 flex-1 min-w-0">
                    <span className="font-medium">Sujet du catalogue de cet encadrant</span>
                    {topicsForSelectedProfessor.length === 0 && (
                      <span className="block text-amber-700 text-xs mt-0.5">
                        Aucun sujet publié par {demandProfessor?.full_name || 'cet encadrant'} pour le moment.
                      </span>
                    )}
                    {topicMode === 'existing' && topicsForSelectedProfessor.length > 0 && (
                      <select
                        value={selectedTopicId}
                        onChange={(e) => setSelectedTopicId(e.target.value)}
                        className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">— Choisir un sujet —</option>
                        {topicsForSelectedProfessor.map((t: any) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 p-3 has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50/50">
                  <input
                    type="radio"
                    name="topicMode"
                    className="mt-1"
                    checked={topicMode === 'suggest'}
                    onChange={() => {
                      setTopicMode('suggest')
                      setSelectedTopicId('')
                    }}
                  />
                  <span className="text-sm text-gray-800 flex-1 min-w-0">
                    <span className="font-medium">Proposer mon propre sujet</span>
                    {topicMode === 'suggest' && (
                      <input
                        type="text"
                        value={suggestedTitle}
                        onChange={(e) => setSuggestedTitle(e.target.value.slice(0, 500))}
                        placeholder="Titre ou idée de sujet"
                        className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500"
                      />
                    )}
                  </span>
                </label>
              </div>

              <label className="block text-sm font-semibold text-gray-800 mb-1">Message pour l&apos;encadrant (facultatif)</label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value.slice(0, 4000))}
                rows={3}
                placeholder="Présentez-vous ou précisez votre demande…"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 mb-6"
              />

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  disabled={demandSubmitting}
                  onClick={closeDemandModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={demandSubmitting}
                  onClick={() => void submitDemandRequest()}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {demandSubmitting ? 'Envoi…' : 'Envoyer la demande'}
                </button>
              </div>
            </div>
          </div>
        )}
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
                {defense.duration_minutes != null && (
                  <p><span className="text-gray-600">Durée prévue :</span> {defense.duration_minutes} minutes</p>
                )}
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

