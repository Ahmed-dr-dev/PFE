'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function StudentDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      async function fetchStudent() {
        try {
          const res = await fetch(`/api/professor/students/${id}`, {
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
      fetchStudent()
    }
  }, [id])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-2xl">
          <p className="text-gray-400 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-8">
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-2xl">
          <p className="text-gray-400 text-lg">Étudiant non trouvé</p>
        </div>
      </div>
    )
  }
  
  const { student, topic, status, progress, startDate, lastMeeting, milestones, meetings } = data

  const upcomingMeetings = meetings?.filter((m: any) => {
    const meetingDate = new Date(m.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return meetingDate >= today
  }).slice(0, 3) || []

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/professor/students"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux étudiants
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{student?.name || student?.full_name || 'N/A'}</h1>
          <p className="text-gray-400 text-lg">Profil étudiant et suivi du PFE</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/professor/students/${id}/meetings`}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm"
          >
            Planifier une réunion
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl flex flex-col min-h-[400px]">
          <h2 className="text-2xl font-bold text-white mb-6">Sujet de PFE</h2>
          {topic ? (
            <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-semibold text-white mb-4">{topic.title}</h3>
              <p className="text-gray-300 leading-relaxed flex-1">{topic.description}</p>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400 text-lg">Aucun sujet assigné</p>
            </div>
          )}
        </div>

        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl flex flex-col min-h-[400px]">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-2xl shadow-lg mb-6">
            {(student?.name || student?.full_name || 'N/A').split(' ').map((n: string) => n[0]).join('')}
          </div>
          <h3 className="text-2xl font-bold text-white mb-6">Informations</h3>
          <div className="space-y-6 flex-1">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</p>
              <p className="text-white font-medium">{student?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Téléphone</p>
              <p className="text-white font-medium">{student?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Département</p>
              <p className="text-white font-medium">{student?.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Année</p>
              <p className="text-white font-medium">{student?.year || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {meetings && Array.isArray(meetings) && meetings.length > 0 && (
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Réunions</h2>
            <Link
              href={`/dashboard/professor/students/${id}/meetings`}
              className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition-colors"
            >
              Voir toutes ({meetings.length})
            </Link>
          </div>
          {upcomingMeetings.length > 0 ? (
            <div className="space-y-4">
              {upcomingMeetings.map((meeting: any) => {
                const meetingDate = new Date(meeting.date || meeting.meeting_date)
                const isPast = meetingDate < new Date()
                return (
                  <div
                    key={meeting.id}
                    className="flex items-start gap-4 p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex flex-col items-center justify-center border border-blue-500/30">
                      <span className="text-xs font-bold text-blue-300">
                        {meetingDate.toLocaleDateString('fr-FR', { day: 'numeric' })}
                      </span>
                      <span className="text-xs font-medium text-blue-300">
                        {meetingDate.toLocaleDateString('fr-FR', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-semibold">{meeting.type || meeting.meeting_type || 'Réunion'}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            meeting.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : meeting.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-200'
                              : isPast
                              ? 'bg-gray-500/20 text-gray-300'
                              : 'bg-blue-500/20 text-blue-200'
                          }`}
                        >
                          {meeting.status === 'completed' ? 'Terminé' : meeting.status === 'cancelled' ? 'Annulé' : isPast ? 'Passé' : 'Planifié'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {meeting.time || 'N/A'} ({meeting.duration || meeting.duration_minutes || 60} min)
                        </span>
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
                        <p className="text-gray-300 text-sm mt-2">{meeting.notes}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">Aucune réunion à venir</p>
          )}
        </div>
      )}
    </div>
  )
}


