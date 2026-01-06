export default function DocumentsPage() {
  const documents = [
    {
      id: '1',
      name: 'Cahier des charges - Version finale',
      type: 'PDF',
      size: '2.4 MB',
      category: 'Cahier des charges',
      uploaded_at: '2024-01-20',
      uploaded_by: 'Prof. Ahmed Benali',
      status: 'approved',
    },
    {
      id: '2',
      name: 'Guide de développement',
      type: 'PDF',
      size: '1.8 MB',
      category: 'Documentation',
      uploaded_at: '2024-02-01',
      uploaded_by: 'Prof. Ahmed Benali',
      status: 'approved',
    },
    {
      id: '3',
      name: 'Rapport d\'avancement - Février 2024',
      type: 'DOCX',
      size: '456 KB',
      category: 'Rapports',
      uploaded_at: '2024-02-28',
      uploaded_by: 'Vous',
      status: 'pending',
    },
    {
      id: '4',
      name: 'Diagramme de l\'architecture',
      type: 'PNG',
      size: '1.2 MB',
      category: 'Design',
      uploaded_at: '2024-03-05',
      uploaded_by: 'Vous',
      status: 'approved',
    },
    {
      id: '5',
      name: 'Base de code - Archive',
      type: 'ZIP',
      size: '15.6 MB',
      category: 'Code source',
      uploaded_at: '2024-03-10',
      uploaded_by: 'Vous',
      status: 'pending',
    },
  ]

  const categories = ['Tous', 'Cahier des charges', 'Documentation', 'Rapports', 'Design', 'Code source']

  const getFileIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      PDF: (
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      DOCX: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      PNG: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      ZIP: (
        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h14a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    }
    return icons[type] || icons.PDF
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Documents <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">PFE</span>
          </h1>
          <p className="text-gray-400 text-lg">Gérez tous vos documents et ressources</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5">
          Téléverser un document
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              category === 'Tous'
                ? 'bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 text-white border border-emerald-500/30'
                : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50 border border-slate-700/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-emerald-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center border border-slate-600/50 group-hover:scale-110 transition-transform duration-300">
                {getFileIcon(doc.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg mb-1 truncate">{doc.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{doc.type}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs font-medium text-gray-300">
                  {doc.category}
                </span>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    doc.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}
                >
                  {doc.status === 'approved' ? 'Approuvé' : 'En attente'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-700/50">
                <p className="text-xs text-gray-500 mb-1">
                  Par {doc.uploaded_by}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(doc.uploaded_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-sm font-semibold text-white transition-all duration-200">
                  Télécharger
                </button>
                <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-sm font-semibold text-white transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
