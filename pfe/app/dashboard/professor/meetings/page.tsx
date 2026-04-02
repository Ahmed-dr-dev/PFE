'use client'

import { useState, useEffect, useCallback } from 'react'

function formatTimeDb(t: string | null | undefined) {
  if (!t) return ''
  return t.length >= 5 ? t.slice(0, 5) : t
}

export default function MyMeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [propCounterId, setPropCounterId] = useState<string | null>(null)
  const [propCounter, setPropCounter] = useState({
    date: '',
    time: '',
    duration: 60,
    meeting_type: 'Suivi',
    professor_notes: '',
  })
  const [propBusy, setPropBusy] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState({
    date: '',
    time: '',
    student: '',
  })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 60,
    type: 'Suivi',
    location: '',
    notes: '',
  })

  const loadAll = useCallback(async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        fetch('/api/professor/meetings'),
        fetch('/api/professor/meeting-proposals'),
      ])
      if (mRes.ok) {
        const data = await mRes.json()
        setMeetings(data.meetings || [])
      }
      if (pRes.ok) {
        const data = await pRes.json()
        setProposals(data.proposals || [])
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const patchProposal = async (id: string, body: Record<string, unknown>) => {
    setPropBusy(id)
    try {
      const res = await fetch(`/api/professor/meeting-proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Erreur')
        return
      }
      setPropCounterId(null)
      await loadAll()
    } finally {
      setPropBusy(null)
    }
  }

  const filteredMeetings = meetings.filter((meeting: any) => {
    if (searchQuery.date) {
      const meetingDate = new Date(meeting.date).toISOString().split('T')[0]
      if (meetingDate !== searchQuery.date) return false
    }
    if (searchQuery.time) {
      const meetingTime = meeting.time?.substring(0, 5) || ''
      if (!meetingTime.includes(searchQuery.time)) return false
    }
    if (searchQuery.student) {
      if (meeting.audience_type === 'group') {
        if (!'tous groupe'.includes(searchQuery.student.toLowerCase())) return false
      } else {
        const studentName = meeting.student?.full_name?.toLowerCase() || ''
        const studentEmail = meeting.student?.email?.toLowerCase() || ''
        const query = searchQuery.student.toLowerCase()
        if (!studentName.includes(query) && !studentEmail.includes(query)) return false
      }
    }
    return true
  })

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.date || !formData.time) {
      alert('Date et heure requises')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/professor/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          time: formData.time,
          duration: formData.duration,
          type: formData.type,
          location: formData.location || null,
          notes: formData.notes || null,
          audience: 'group',
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setShowForm(false)
        setFormData({ date: '', time: '', duration: 60, type: 'Suivi', location: '', notes: '' })
        await loadAll()
      } else {
        alert(data.error || 'Erreur lors de la création')
      }
    } catch (err) {
      alert('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
          Mes <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">réunions</span>
        </h1>
        <p className="text-gray-600 text-lg">Gérez toutes vos réunions avec vos étudiants</p>
      </div>

      <div className="relative bg-white rounded-2xl border border-amber-200/80 p-6 shadow-2xl space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Propositions de réunion (étudiants)</h2>
        <p className="text-sm text-gray-600">
          Acceptez le créneau, proposez une autre date via le calendrier, ou refusez. L’étudiant peut contre-proposer jusqu’à accord.
        </p>
        {proposals.filter((p) => p.status === 'negotiating').length === 0 &&
        proposals.filter((p) => p.status !== 'negotiating').length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune proposition pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {proposals.map((p) => {
              const st = p.student
              const open = p.status === 'negotiating'
              const needProf = open && p.waiting_on === 'professor'
              if (!open) {
                return (
                  <div
                    key={p.id}
                    className="border border-gray-100 rounded-xl p-4 bg-gray-50/80 text-sm text-gray-600"
                  >
                    <span className="font-medium text-gray-800">{st?.full_name || 'Étudiant'}</span>
                    {' — '}
                    {p.status === 'agreed' ? 'Accord (réunion créée)' : 'Refusée'}
                    {' — '}
                    {p.proposed_date} {formatTimeDb(p.proposed_time)}
                  </div>
                )
              }
              return (
                <div key={p.id} className="border border-amber-100 rounded-xl p-4 space-y-3 bg-amber-50/30">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-semibold text-gray-900">{st?.full_name || st?.email || 'Étudiant'}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        needProf ? 'bg-amber-200 text-amber-950' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {needProf ? 'À traiter' : 'En attente de l’étudiant'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Créneau : <strong>{p.proposed_date}</strong> à <strong>{formatTimeDb(p.proposed_time)}</strong> —{' '}
                    {p.duration_minutes} min — {p.meeting_type}
                  </p>
                  {p.student_notes && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Étudiant : </span>
                      {p.student_notes}
                    </p>
                  )}
                  {p.professor_notes && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Votre dernier message : </span>
                      {p.professor_notes}
                    </p>
                  )}
                  {needProf && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        disabled={propBusy === p.id}
                        onClick={() => patchProposal(p.id, { action: 'accept' })}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Accepter ce créneau
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPropCounterId(propCounterId === p.id ? null : p.id)
                          setPropCounter({
                            date: p.proposed_date,
                            time: formatTimeDb(p.proposed_time),
                            duration: p.duration_minutes || 60,
                            meeting_type: p.meeting_type || 'Suivi',
                            professor_notes: p.professor_notes || '',
                          })
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-800 text-sm rounded-lg hover:bg-white"
                      >
                        {propCounterId === p.id ? 'Fermer' : 'Autre date / heure'}
                      </button>
                      <button
                        type="button"
                        disabled={propBusy === p.id}
                        onClick={() => {
                          if (!confirm('Refuser définitivement cette demande ?')) return
                          patchProposal(p.id, { action: 'reject' })
                        }}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                  {propCounterId === p.id && needProf && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                        <input
                          type="date"
                          value={propCounter.date}
                          onChange={(e) => setPropCounter({ ...propCounter, date: e.target.value })}
                          className="w-full px-3 py-2 bg-white border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Heure</label>
                        <input
                          type="time"
                          value={propCounter.time}
                          onChange={(e) => setPropCounter({ ...propCounter, time: e.target.value })}
                          className="w-full px-3 py-2 bg-white border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Durée (min)</label>
                        <input
                          type="number"
                          min={15}
                          step={15}
                          value={propCounter.duration}
                          onChange={(e) =>
                            setPropCounter({ ...propCounter, duration: Number(e.target.value) || 60 })
                          }
                          className="w-full px-3 py-2 bg-white border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                        <input
                          type="text"
                          value={propCounter.meeting_type}
                          onChange={(e) => setPropCounter({ ...propCounter, meeting_type: e.target.value })}
                          className="w-full px-3 py-2 bg-white border rounded-lg text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Message (optionnel)</label>
                        <textarea
                          rows={2}
                          value={propCounter.professor_notes}
                          onChange={(e) =>
                            setPropCounter({ ...propCounter, professor_notes: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white border rounded-lg text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          disabled={propBusy === p.id}
                          onClick={() =>
                            patchProposal(p.id, {
                              action: 'counter',
                              date: propCounter.date,
                              time: propCounter.time,
                              duration_minutes: propCounter.duration,
                              meeting_type: propCounter.meeting_type,
                              professor_notes: propCounter.professor_notes || null,
                            })
                          }
                          className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 disabled:opacity-50"
                        >
                          Envoyer la contre-proposition
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Planifier une réunion</h2>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
          >
            {showForm ? 'Annuler' : 'Nouvelle réunion'}
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleCreateMeeting} className="border-t border-gray-200 pt-6 mt-4 space-y-4">
            <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
              Cette réunion sera créée pour tous vos étudiants encadrés.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Heure</label>
                <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Durée (min)</label>
                <input type="number" min={15} step={15} value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) || 60 })} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Type</label>
                <input type="text" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} placeholder="Suivi, Point d'avancement..." className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Lieu</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Salle, bureau..." className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200" placeholder="Optionnel" />
            </div>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50">
              {saving ? 'Création...' : 'Planifier la réunion'}
            </button>
          </form>
        )}
      </div>

      <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Rechercher</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Date</label>
            <input
              type="date"
              value={searchQuery.date}
              onChange={(e) => setSearchQuery({ ...searchQuery, date: e.target.value })}
              className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Heure</label>
            <input
              type="time"
              value={searchQuery.time}
              onChange={(e) => setSearchQuery({ ...searchQuery, time: e.target.value })}
              className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Étudiant</label>
            <input
              type="text"
              value={searchQuery.student}
              onChange={(e) => setSearchQuery({ ...searchQuery, student: e.target.value })}
              placeholder="Nom ou email..."
              className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMeetings.length > 0 ? filteredMeetings.map((meeting: any) => {
          const meetingDate = new Date(meeting.date)
          const timeStr = meeting.time || ''
          
          return (
            <div
              key={meeting.id}
              className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex flex-col items-center justify-center border border-blue-500/30">
                    <span className="text-xs font-bold text-blue-700">
                      {meetingDate.toLocaleDateString('fr-FR', { day: 'numeric' })}
                    </span>
                    <span className="text-xs font-medium text-blue-700">
                      {meetingDate.toLocaleDateString('fr-FR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-gray-900 font-semibold text-lg">{meeting.type || 'Réunion'}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                          meeting.audience_type === 'group'
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {meeting.audience_type === 'group' ? 'Groupe' : 'Seul'}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                          meeting.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : meeting.status === 'cancelled'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {meeting.status === 'completed' ? 'Terminé' : meeting.status === 'cancelled' ? 'Annulé' : 'Planifié'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {timeStr} ({meeting.duration || 60} min)
                      </span>
                      {meeting.audience_type === 'group' ? (
                        <span className="flex items-center gap-1 text-violet-600 font-medium">Tous les étudiants</span>
                      ) : meeting.student ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {meeting.student.full_name || meeting.student.email}
                        </span>
                      ) : null}
                      {meeting.location && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {meeting.location}
                        </span>
                      )}
                    </div>
                    {meeting.notes && (
                      <p className="text-gray-700 text-sm">{meeting.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        }) : (
          <div className="relative bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xl">
            <p className="text-gray-600 text-lg">
              {Object.values(searchQuery).some(v => v) ? 'Aucune réunion trouvée' : 'Aucune réunion planifiée'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
