'use client'

import { useState, useEffect } from 'react'

export default function MyMeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState({
    date: '',
    time: '',
    student: '',
  })

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const res = await fetch('/api/professor/meetings')
        if (res.ok) {
          const data = await res.json()
          setMeetings(data.meetings || [])
        }
      } catch (error) {
        console.error('Error fetching meetings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMeetings()
  }, [])

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
      const studentName = meeting.student?.full_name?.toLowerCase() || ''
      const studentEmail = meeting.student?.email?.toLowerCase() || ''
      const query = searchQuery.student.toLowerCase()
      if (!studentName.includes(query) && !studentEmail.includes(query)) return false
    }
    return true
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
          Mes <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">réunions</span>
        </h1>
        <p className="text-gray-400 text-lg">Gérez toutes vos réunions avec vos étudiants</p>
      </div>

      <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Rechercher</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Date</label>
            <input
              type="date"
              value={searchQuery.date}
              onChange={(e) => setSearchQuery({ ...searchQuery, date: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Heure</label>
            <input
              type="time"
              value={searchQuery.time}
              onChange={(e) => setSearchQuery({ ...searchQuery, time: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Étudiant</label>
            <input
              type="text"
              value={searchQuery.student}
              onChange={(e) => setSearchQuery({ ...searchQuery, student: e.target.value })}
              placeholder="Nom ou email..."
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
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
              className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex flex-col items-center justify-center border border-blue-500/30">
                    <span className="text-xs font-bold text-blue-300">
                      {meetingDate.toLocaleDateString('fr-FR', { day: 'numeric' })}
                    </span>
                    <span className="text-xs font-medium text-blue-300">
                      {meetingDate.toLocaleDateString('fr-FR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold text-lg">{meeting.type || 'Réunion'}</h3>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                          meeting.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50'
                            : meeting.status === 'cancelled'
                            ? 'bg-red-500/20 text-red-200 border-red-500/50'
                            : 'bg-blue-500/20 text-blue-200 border-blue-500/50'
                        }`}
                      >
                        {meeting.status === 'completed' ? 'Terminé' : meeting.status === 'cancelled' ? 'Annulé' : 'Planifié'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {timeStr} ({meeting.duration || 60} min)
                      </span>
                      {meeting.student && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {meeting.student.full_name || meeting.student.email}
                        </span>
                      )}
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
                      <p className="text-gray-300 text-sm">{meeting.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        }) : (
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-xl">
            <p className="text-gray-400 text-lg">
              {Object.values(searchQuery).some(v => v) ? 'Aucune réunion trouvée' : 'Aucune réunion planifiée'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
