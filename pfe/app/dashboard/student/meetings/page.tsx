'use client'

import { useState, useEffect, useCallback } from 'react'

function formatTimeDb(t: string | null | undefined) {
  if (!t) return ''
  return t.length >= 5 ? t.slice(0, 5) : t
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [savingProposal, setSavingProposal] = useState(false)
  const [proposalForm, setProposalForm] = useState({
    date: '',
    time: '',
    duration: 60,
    meeting_type: 'Suivi',
    student_notes: '',
  })
  const [counterId, setCounterId] = useState<string | null>(null)
  const [counterFields, setCounterFields] = useState({ date: '', time: '', student_notes: '' })
  const [busyId, setBusyId] = useState<string | null>(null)
  const today = new Date().toISOString().split('T')[0]

  const refresh = useCallback(async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        fetch('/api/student/meetings', { cache: 'no-store' }),
        fetch('/api/student/meeting-proposals', { cache: 'no-store' }),
      ])
      if (mRes.ok) {
        const d = await mRes.json()
        setMeetings(d.meetings || [])
      }
      if (pRes.ok) {
        const d = await pRes.json()
        setProposals(d.proposals || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const submitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proposalForm.date || !proposalForm.time) return
    if (proposalForm.date < today) {
      alert('La date proposée ne peut pas être dans le passé.')
      return
    }
    setSavingProposal(true)
    try {
      const res = await fetch('/api/student/meeting-proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: proposalForm.date,
          time: proposalForm.time,
          duration_minutes: proposalForm.duration,
          meeting_type: proposalForm.meeting_type,
          student_notes: proposalForm.student_notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Erreur')
        return
      }
      setProposalForm({
        date: '',
        time: '',
        duration: 60,
        meeting_type: 'Suivi',
        student_notes: '',
      })
      await refresh()
    } finally {
      setSavingProposal(false)
    }
  }

  const patchProposal = async (
    id: string,
    payload: Record<string, unknown>
  ) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/student/meeting-proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Erreur')
        return
      }
      setCounterId(null)
      await refresh()
    } finally {
      setBusyId(null)
    }
  }

  const filteredMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.date || meeting.meeting_date)
    const dateStr = meetingDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const timeStr = meeting.time || ''
    const typeStr = (meeting.type || meeting.meeting_type || '').toLowerCase()
    const locationStr = (meeting.location || '').toLowerCase()
    const notesStr = (meeting.notes || '').toLowerCase()
    const searchLower = searchTerm.toLowerCase()

    return (
      dateStr.toLowerCase().includes(searchLower) ||
      timeStr.toLowerCase().includes(searchLower) ||
      typeStr.includes(searchLower) ||
      locationStr.includes(searchLower) ||
      notesStr.includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
          Mes <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Réunions</span>
        </h1>
        <p className="text-gray-600 text-lg">Réunions de l’encadrant et vos propositions de créneaux</p>
      </div>

      {/* Section A — Propositions */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
          Proposer un créneau avec mon encadrant
        </h2>
        <div className="relative bg-white rounded-2xl border border-amber-200/80 p-6 shadow-xl bg-gradient-to-br from-amber-50/40 to-white">
          <p className="text-sm text-gray-600 mb-4">
            Vous proposez une date : l’encadrant peut accepter, proposer une autre date (calendrier ci-dessous) ou refuser.
            Vous pouvez à votre tour contre-proposer jusqu’à accord.
          </p>
          <form onSubmit={submitProposal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Date</label>
              <input
                type="date"
                required
                min={today}
                value={proposalForm.date}
                onChange={(e) => setProposalForm({ ...proposalForm, date: e.target.value })}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Heure</label>
              <input
                type="time"
                required
                value={proposalForm.time}
                onChange={(e) => setProposalForm({ ...proposalForm, time: e.target.value })}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Durée (min)</label>
              <input
                type="number"
                min={15}
                step={15}
                value={proposalForm.duration}
                onChange={(e) =>
                  setProposalForm({ ...proposalForm, duration: Number(e.target.value) || 60 })
                }
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Type</label>
              <input
                type="text"
                value={proposalForm.meeting_type}
                onChange={(e) => setProposalForm({ ...proposalForm, meeting_type: e.target.value })}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Message (optionnel)</label>
              <textarea
                rows={2}
                value={proposalForm.student_notes}
                onChange={(e) => setProposalForm({ ...proposalForm, student_notes: e.target.value })}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
                placeholder="Objet du rendez-vous, contraintes…"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                disabled={savingProposal}
                className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium disabled:opacity-50"
              >
                {savingProposal ? 'Envoi…' : 'Envoyer la proposition'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Suivi de mes propositions</h3>
          {proposals.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune proposition pour le moment.</p>
          ) : (
            proposals.map((p) => {
              const sup = p.supervisor
              const negotiating = p.status === 'negotiating'
              const waitingStudent = negotiating && p.waiting_on === 'student'
              const waitingProf = negotiating && p.waiting_on === 'professor'

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 shadow-md space-y-3"
                >
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <span className="font-medium text-gray-900">
                      {sup?.full_name || 'Encadrant'}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        p.status === 'agreed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : waitingProf
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {p.status === 'agreed'
                        ? 'Accord — réunion créée'
                        : p.status === 'rejected'
                        ? 'Refusée'
                        : waitingProf
                        ? 'En attente de l’encadrant'
                        : 'À vous de répondre'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Créneau actuel : </span>
                    {p.proposed_date} à {formatTimeDb(p.proposed_time)} — {p.duration_minutes} min —{' '}
                    {p.meeting_type}
                  </div>
                  {p.student_notes && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Votre message : </span>
                      {p.student_notes}
                    </p>
                  )}
                  {p.professor_notes && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Encadrant : </span>
                      {p.professor_notes}
                    </p>
                  )}

                  {waitingStudent && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => patchProposal(p.id, { action: 'accept' })}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Accepter ce créneau
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCounterId(counterId === p.id ? null : p.id)
                          setCounterFields({
                            date: p.proposed_date,
                            time: formatTimeDb(p.proposed_time),
                            student_notes: p.student_notes || '',
                          })
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-800 text-sm rounded-lg hover:bg-gray-50"
                      >
                        {counterId === p.id ? 'Fermer' : 'Proposer une autre date'}
                      </button>
                    </div>
                  )}

                  {counterId === p.id && waitingStudent && (
                    <div className="pl-0 md:pl-2 space-y-3 border-l-2 border-amber-400 ml-1 py-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Nouvelle date</label>
                          <input
                            type="date"
                            min={today}
                            value={counterFields.date}
                            onChange={(e) => setCounterFields({ ...counterFields, date: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-100 border rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Nouvelle heure</label>
                          <input
                            type="time"
                            value={counterFields.time}
                            onChange={(e) => setCounterFields({ ...counterFields, time: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-100 border rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Précision (optionnel)</label>
                        <textarea
                          rows={2}
                          value={counterFields.student_notes}
                          onChange={(e) =>
                            setCounterFields({ ...counterFields, student_notes: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-gray-100 border rounded-lg text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => {
                          if (counterFields.date < today) {
                            alert('La date proposée ne peut pas être dans le passé.')
                            return
                          }
                          patchProposal(p.id, {
                            action: 'counter',
                            date: counterFields.date,
                            time: counterFields.time,
                            student_notes: counterFields.student_notes || null,
                          })
                        }}
                        className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 disabled:opacity-50"
                      >
                        Envoyer la contre-proposition
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* Section B — Réunions encadrant */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
          Réunions planifiées par mon encadrant
        </h2>

        <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par date, heure, type, lieu ou notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredMeetings && filteredMeetings.length > 0 ? (
            filteredMeetings.map((meeting: any) => {
              const meetingDate = new Date(meeting.date || meeting.meeting_date)
              const timeStr =
                meeting.time || meetingDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

              return (
                <div
                  key={meeting.id}
                  className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-xl hover:border-emerald-200 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex flex-col items-center justify-center border border-blue-500/30 shrink-0">
                      <span className="text-xs font-bold text-blue-700">
                        {meetingDate.toLocaleDateString('fr-FR', { day: 'numeric' })}
                      </span>
                      <span className="text-xs font-medium text-blue-700">
                        {meetingDate.toLocaleDateString('fr-FR', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-gray-900 font-semibold text-lg">
                          {meeting.type || meeting.meeting_type || 'Réunion'}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-medium shrink-0 ${
                            meeting.audience_type === 'group'
                              ? 'bg-violet-100 text-violet-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {meeting.audience_type === 'group' ? 'Groupe' : 'Seul'}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border shrink-0 ${
                            meeting.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : meeting.status === 'cancelled'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {meeting.status === 'completed'
                            ? 'Terminé'
                            : meeting.status === 'cancelled'
                            ? 'Annulé'
                            : 'Planifié'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {meetingDate.toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {timeStr} ({meeting.duration || meeting.duration_minutes || 60} min)
                        </span>
                        {meeting.location && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {meeting.location}
                          </span>
                        )}
                      </div>
                      {meeting.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{meeting.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="relative bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xl">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-lg">
                {searchTerm ? 'Aucune réunion ne correspond à votre recherche' : 'Aucune réunion planifiée par l’encadrant'}
              </p>
              {!searchTerm && (
                <p className="text-gray-500 text-sm mt-2">Les réunions de groupe ou individuelles apparaissent ici</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
