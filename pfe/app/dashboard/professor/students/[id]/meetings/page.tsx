'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

async function getMeetings(studentId: string) {
  try {
    const res = await fetch(`/api/professor/students/${studentId}/meetings`)
    if (!res.ok) return []
    const data = await res.json()
    return data.meetings || []
  } catch (error) {
    return []
  }
}

export default function MeetingsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<any>(null)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 60,
    type: 'Suivi',
    notes: '',
    location: '',
  })

  useEffect(() => {
    if (id) {
      async function fetchMeetings() {
        const data = await getMeetings(id)
        setMeetings(data)
        setLoading(false)
      }
      fetchMeetings()
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingMeeting) {
        // Update meeting
        const res = await fetch(`/api/professor/meetings/${editingMeeting.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (res.ok) {
          const data = await res.json()
          setMeetings(meetings.map(m => m.id === editingMeeting.id ? data.meeting : m))
          setFormData({ date: '', time: '', duration: 60, type: 'Suivi', notes: '', location: '' })
          setShowForm(false)
          setEditingMeeting(null)
        } else {
          const error = await res.json()
          alert(error.error || 'Erreur lors de la mise à jour de la réunion')
        }
      } else {
        // Create meeting
        const res = await fetch(`/api/professor/students/${id}/meetings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (res.ok) {
          router.refresh()
          const data = await res.json()
          setMeetings([data.meeting, ...meetings])
          setFormData({ date: '', time: '', duration: 60, type: 'Suivi', notes: '', location: '' })
          setShowForm(false)
        } else {
          const error = await res.json()
          alert(error.error || 'Erreur lors de la création de la réunion')
        }
      }
    } catch (error) {
      console.error('Error saving meeting:', error)
      alert('Erreur lors de l\'enregistrement de la réunion')
    }
  }

  const handleEdit = (meeting: any) => {
    const meetingDate = new Date(meeting.date || meeting.meeting_date)
    setEditingMeeting(meeting)
    setFormData({
      date: meetingDate.toISOString().split('T')[0],
      time: meeting.time || '',
      duration: meeting.duration || meeting.duration_minutes || 60,
      type: meeting.type || meeting.meeting_type || 'Suivi',
      notes: meeting.notes || '',
      location: meeting.location || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (meetingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réunion ?')) {
      return
    }

    try {
      const res = await fetch(`/api/professor/meetings/${meetingId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMeetings(meetings.filter(m => m.id !== meetingId))
      } else {
        const error = await res.json()
        alert(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting meeting:', error)
      alert('Erreur lors de la suppression')
    }
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={`/dashboard/professor/students/${id}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au profil
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Réunions de <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">suivi</span>
          </h1>
          <p className="text-gray-400 text-lg">Planifiez et gérez les réunions avec l'étudiant</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            if (showForm) {
              setEditingMeeting(null)
              setFormData({ date: '', time: '', duration: 60, type: 'Suivi', notes: '', location: '' })
            }
          }}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25"
        >
          {showForm ? 'Annuler' : 'Nouvelle réunion'}
        </button>
      </div>

      {showForm && (
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">
            {editingMeeting ? 'Modifier la réunion' : 'Planifier une réunion'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Heure</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Durée (minutes)</label>
                <input
                  type="number"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option>Suivi</option>
                  <option>Révision</option>
                  <option>Présentation</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Lieu</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Lieu de la réunion"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 resize-none"
                placeholder="Notes ou ordre du jour..."
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25"
              >
                {editingMeeting ? 'Enregistrer les modifications' : 'Planifier la réunion'}
              </button>
              {editingMeeting && (
                <button
                  type="button"
                  onClick={() => handleDelete(editingMeeting.id)}
                  className="px-6 py-3 bg-red-600/20 text-red-300 border border-red-500/50 rounded-xl hover:bg-red-600/30 transition-all duration-200 font-semibold text-sm"
                >
                  Supprimer
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {meetings && meetings.length > 0 ? meetings.map((meeting: any) => {
          const meetingDate = new Date(meeting.date || meeting.meeting_date)
          const timeStr = meeting.time || meetingDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          
          return (
            <div
              key={meeting.id}
              className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
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
                      <h3 className="text-white font-semibold text-lg">{meeting.type || meeting.meeting_type || 'Réunion'}</h3>
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
                        {timeStr} ({meeting.duration || meeting.duration_minutes || 60} min)
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
                      <p className="text-gray-300 text-sm">{meeting.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(meeting)}
                    className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold text-sm"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          )
        }) : (
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-xl">
            <p className="text-gray-400 text-lg">Aucune réunion planifiée</p>
          </div>
        )}
      </div>
    </div>
  )
}


