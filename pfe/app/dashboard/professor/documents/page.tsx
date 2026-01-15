import React from 'react'
import { UploadButton } from './upload-button'
import { DocumentActions } from './document-actions'

async function getDocuments() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/professor/documents`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.documents || []
  } catch (error) {
    return []
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE'
  return ext
}

export default async function DocumentsPage() {
  const documents = await getDocuments()

  const getFileIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
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
        <UploadButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents && documents.length > 0 ? documents.map((doc: any, index: number) => (
          <div
            key={doc.id || index}
            className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-emerald-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center border border-slate-600/50 group-hover:scale-110 transition-transform duration-300">
                {getFileIcon(getFileType(doc.file_name || doc.name || ''))}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg mb-1 truncate">{doc.file_name || doc.name || 'Document'}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{getFileType(doc.file_name || doc.name || '')}</span>
                  <span>•</span>
                  <span>{doc.file_size ? formatFileSize(doc.file_size) : 'N/A'}</span>
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
                  {doc.uploader ? `Par ${doc.uploader.full_name || 'N/A'}` : 'Partagé avec les étudiants'}
                </p>
                {doc.project?.student && (
                  <p className="text-xs text-gray-400">
                    Étudiant: {doc.project.student.full_name || 'N/A'}
                  </p>
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
                {doc.file_path && (
                  <a
                    href={doc.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-sm font-semibold text-white transition-all duration-200 text-center"
                  >
                    Télécharger
                  </a>
                )}
                <DocumentActions documentId={doc.id} />
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-xl">
            <p className="text-gray-400 text-lg">Aucun document disponible</p>
          </div>
        )}
      </div>
    </div>
  )
}

