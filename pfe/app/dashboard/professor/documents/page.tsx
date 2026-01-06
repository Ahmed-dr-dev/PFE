export default function DocumentsPage() {
  const documents = [
    {
      id: '1',
      name: 'Cahier des charges - Système bibliothèque',
      type: 'PDF',
      size: '2.4 MB',
      category: 'Cahier des charges',
      uploaded_at: '2024-01-20',
      shared_with: ['Abdelrahman Ali'],
    },
    {
      id: '2',
      name: 'Guide de développement',
      type: 'PDF',
      size: '1.8 MB',
      category: 'Documentation',
      uploaded_at: '2024-02-01',
      shared_with: ['Tous les étudiants'],
    },
    {
      id: '3',
      name: 'Rapport d\'avancement - Février 2024',
      type: 'DOCX',
      size: '456 KB',
      category: 'Rapports',
      uploaded_at: '2024-02-28',
      uploaded_by: 'Abdelrahman Ali',
    },
  ]

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
              </div>

              <div className="pt-3 border-t border-slate-700/50">
                <p className="text-xs text-gray-500 mb-1">
                  {doc.uploaded_by ? `Par ${doc.uploaded_by}` : 'Partagé avec'}
                </p>
                {doc.shared_with && (
                  <p className="text-xs text-gray-400">{doc.shared_with.join(', ')}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
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

