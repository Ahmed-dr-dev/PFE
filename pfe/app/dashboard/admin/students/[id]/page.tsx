import Link from 'next/link'

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const student = {
    id: params.id,
    name: 'Abdelrahman Ali',
    email: 'abdelrahman.ali@student.isaeg.ma',
    phone: '+212 6XX XXX XXX',
    department: 'Informatique',
    year: '5ème année',
    topic: {
      id: '1',
      title: 'Système de gestion de bibliothèque',
      professor: 'Prof. Ahmed Benali',
    },
    status: 'in_progress',
    progress: 65,
    startDate: '2024-01-20',
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/admin/students"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux étudiants
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{student.name}</h1>
          <p className="text-gray-400 text-lg">Profil étudiant et informations du PFE</p>
        </div>
        <Link
          href={`/dashboard/admin/assignments?student=${student.id}`}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm"
        >
          Affecter un encadrant
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Sujet de PFE</h2>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">{student.topic.title}</h3>
              <p className="text-gray-400 text-sm mb-4">Encadrant: {student.topic.professor}</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Progression</p>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-slate-700/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                  <span className="text-white font-semibold">{student.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-2xl shadow-lg mb-4">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h3 className="text-lg font-bold text-white mb-4">Informations</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                <p className="text-white font-medium text-sm">{student.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Téléphone</p>
                <p className="text-white font-medium text-sm">{student.phone}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Département</p>
                <p className="text-white font-medium text-sm">{student.department}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Année</p>
                <p className="text-white font-medium text-sm">{student.year}</p>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Début du projet</p>
                <p className="text-white font-semibold">{new Date(student.startDate).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Statut</p>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold border bg-blue-500/20 text-blue-200 border-blue-500/50">
                  En cours
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


