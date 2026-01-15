'use client'

import { useState, useEffect } from 'react'

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const res = await fetch('/api/student/meetings', {
          cache: 'no-store',
        })
        if (!res.ok) return
        const data = await res.json()
        setMeetings(data.meetings || [])
      } catch (error) {
        console.error('Error fetching meetings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMeetings()
  }, [])

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
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
          Mes <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Réunions</span>
        </h1>
        <p className="text-gray-400 text-lg">Réunions planifiées par votre encadrant</p>
      </div>

      <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par date, heure, type, lieu ou notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredMeetings && filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting: any) => {
            const meetingDate = new Date(meeting.date || meeting.meeting_date)
            const timeStr = meeting.time || meetingDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

            return (
              <div
                key={meeting.id}
                className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl hover:border-emerald-500/50 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex flex-col items-center justify-center border border-blue-500/30 shrink-0">
                    <span className="text-xs font-bold text-blue-300">
                      {meetingDate.toLocaleDateString('fr-FR', { day: 'numeric' })}
                    </span>
                    <span className="text-xs font-medium text-blue-300">
                      {meetingDate.toLocaleDateString('fr-FR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-white font-semibold text-lg">
                        {meeting.type || meeting.meeting_type || 'Réunion'}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border shrink-0 ${
                          meeting.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50'
                            : meeting.status === 'cancelled'
                            ? 'bg-red-500/20 text-red-200 border-red-500/50'
                            : 'bg-blue-500/20 text-blue-200 border-blue-500/50'
                        }`}
                      >
                        {meeting.status === 'completed'
                          ? 'Terminé'
                          : meeting.status === 'cancelled'
                          ? 'Annulé'
                          : 'Planifié'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-2 flex-wrap">
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
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{meeting.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-xl">
            <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">
              {searchTerm ? 'Aucune réunion ne correspond à votre recherche' : 'Aucune réunion planifiée'}
            </p>
            {!searchTerm && (
              <p className="text-gray-500 text-sm mt-2">Votre encadrant planifiera des réunions ici</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
