export default function CalendarPage() {
  const events = [
    {
      id: '1',
      title: 'Réunion avec Abdelrahman Ali',
      date: '2024-03-15',
      time: '14:00 - 15:30',
      type: 'meeting',
      student: 'Abdelrahman Ali',
    },
    {
      id: '2',
      title: 'Révision - Fatima Zahra',
      date: '2024-03-18',
      time: '15:00 - 16:00',
      type: 'review',
      student: 'Fatima Zahra',
    },
    {
      id: '3',
      title: 'Présentation des projets',
      date: '2024-03-25',
      time: '10:00 - 12:00',
      type: 'presentation',
      student: 'Tous les étudiants',
    },
  ]

  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Calendrier</span>
        </h1>
        <p className="text-gray-400 text-lg">Gérez vos rendez-vous et échéances</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{currentMonth}</h2>
              <div className="flex gap-2">
                <button className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 transition-colors">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 transition-colors">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, index) => {
                const day = index - 5
                const isToday = day === currentDate.getDate()
                const hasEvent = events.some(
                  (e) => new Date(e.date).getDate() === day && new Date(e.date).getMonth() === currentDate.getMonth()
                )

                return (
                  <div
                    key={index}
                    className={`aspect-square rounded-xl border transition-all duration-200 ${
                      isToday
                        ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/50 shadow-lg'
                        : hasEvent
                        ? 'bg-slate-700/30 border-slate-600/50 hover:border-emerald-500/50'
                        : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
                    } ${day <= 0 || day > 31 ? 'opacity-30' : 'cursor-pointer hover:scale-105'}`}
                  >
                    {day > 0 && day <= 31 && (
                      <div className="p-2 h-full flex flex-col">
                        <span className={`text-sm font-semibold ${isToday ? 'text-white' : 'text-gray-400'}`}>
                          {day}
                        </span>
                        {hasEvent && (
                          <div className="mt-auto">
                            <div className="w-full h-1.5 rounded-full bg-emerald-500/50" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Événements à venir
            </h2>
            <div className="space-y-4">
              {events.map((event) => {
                const eventDate = new Date(event.date)
                const typeColors = {
                  meeting: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300',
                  review: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
                  presentation: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300',
                }

                return (
                  <div
                    key={event.id}
                    className="p-6 bg-slate-700/30 border border-blue-500/50 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${typeColors[event.type as keyof typeof typeColors]} flex flex-col items-center justify-center border shrink-0`}>
                        <span className="text-xs font-bold">
                          {eventDate.toLocaleDateString('fr-FR', { day: 'numeric' })}
                        </span>
                        <span className="text-xs font-medium">
                          {eventDate.toLocaleDateString('fr-FR', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-semibold text-lg">{event.title}</h3>
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r ${typeColors[event.type as keyof typeof typeColors]}`}>
                            {event.type === 'meeting' && 'Réunion'}
                            {event.type === 'review' && 'Révision'}
                            {event.type === 'presentation' && 'Présentation'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {event.student}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Aujourd'hui</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl">
                <p className="text-2xl font-bold text-white mb-1">{currentDate.getDate()}</p>
                <p className="text-gray-400 text-sm">
                  {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {currentDate.toLocaleDateString('fr-FR', { weekday: 'long' })}
                </p>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Statistiques</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">Réunions ce mois</p>
                <p className="text-2xl font-bold text-white">{events.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

