'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MeetingsPage({ params }: { params: { id: string } }) {
  const [meetings, setMeetings] = useState([
    {
      id: '1',
      date: '2024-03-15',
      time: '14:00',
      duration: 90,
      type: 'Suivi',
      status: 'planned',
      notes: 'Discussion sur l\'avancement du projet et les prochaines étapes',
    },
    {
      id: '2',
      date: '2024-03-01',
      time: '15:30',
      duration: 60,
      type: 'Révision',
      status: 'completed',
      notes: 'Révision du code et validation de l\'architecture',
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 60,
    type: 'Suivi',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newMeeting = {
      id: Date.now().toString(),
      ...formData,
      status: 'planned',
    }
    setMeetings([newMeeting, ...meetings])
    setFormData({ date: '', time: '', duration: 60, type: 'Suivi', notes: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={`/dashboard/professor/students/${params.id}`}
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
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25"
        >
          {showForm ? 'Annuler' : 'Nouvelle réunion'}
        </button>
      </div>

      {showForm && (
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Planifier une réunion</h2>
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
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25"
            >
              Planifier la réunion
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex flex-col items-center justify-center border border-blue-500/30">
                  <span className="text-xs font-bold text-blue-300">
                    {new Date(meeting.date).toLocaleDateString('fr-FR', { day: 'numeric' })}
                  </span>
                  <span className="text-xs font-medium text-blue-300">
                    {new Date(meeting.date).toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold text-lg">{meeting.type}</h3>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                        meeting.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50'
                          : 'bg-blue-500/20 text-blue-200 border-blue-500/50'
                      }`}
                    >
                      {meeting.status === 'completed' ? 'Terminé' : 'Planifié'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {meeting.time} ({meeting.duration} min)
                    </span>
                  </div>
                  {meeting.notes && (
                    <p className="text-gray-300 text-sm">{meeting.notes}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


