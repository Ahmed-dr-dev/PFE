'use client'

import React, { useEffect, useState } from 'react'
import { SuiviUploadButton } from './upload-button'
import { DocumentActions } from '../documents/document-actions'

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

export default function SuiviPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [supervisorNotes, setSupervisorNotes] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [docRes, pfeRes] = await Promise.all([
          fetch('/api/student/documents', { cache: 'no-store' }),
          fetch('/api/student/my-pfe', { cache: 'no-store' }),
        ])
        if (docRes.ok) {
          const data = await docRes.json()
          setDocuments(data.documents || [])
        }
        if (pfeRes.ok) {
          const pfeData = await pfeRes.json()
          setSupervisorNotes(pfeData.pfe?.supervisor_notes || null)
        }
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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

  const myDocs = documents.filter((d: any) => d.pfe_project_id != null)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Suivi <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">PFE</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Partagez vos avancements et documents avec votre encadrant. Téléversez rapports, livrables ou présentations pour montrer l&apos;avancement de votre projet.
          </p>
        </div>
        <SuiviUploadButton />
      </div>

      {loading ? (
        <div className="relative bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xl">
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      ) : (
        <>
          {supervisorNotes && (
            <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-amber-900 mb-2">Note / Remarques de votre encadrant</h2>
              <p className="text-gray-700 whitespace-pre-wrap text-sm">{supervisorNotes}</p>
            </section>
          )}
          {myDocs.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vos partages avec l&apos;encadrant</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myDocs.map((doc: any, index: number) => (
                  <div
                    key={doc.id || index}
                    className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-emerald-200 transition-all duration-300 shadow-xl hover:shadow-emerald-500/10"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                        {getFileIcon(getFileType(doc.file_name || doc.name || ''))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 font-semibold text-lg mb-1 truncate">{doc.file_name || doc.name || 'Document'}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{getFileType(doc.file_name || doc.name || '')}</span>
                          <span>•</span>
                          <span>{doc.file_size ? formatFileSize(doc.file_size) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800">
                        {doc.category || 'Autre'}
                      </span>
                      {doc.status && (
                        <span
                          className={`ml-2 px-3 py-1 rounded-lg text-xs font-semibold ${
                            doc.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {doc.status === 'approved' ? 'Vu par l\'encadrant' : 'En attente'}
                        </span>
                      )}
                      <p className="text-xs text-gray-500">
                        Partagé le {new Date(doc.uploaded_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      {doc.professor_review && (
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs font-semibold text-amber-800 mb-1">Correction / Avis de l&apos;encadrant</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{doc.professor_review}</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        {doc.file_path && (
                          <a
                            href={doc.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 text-center"
                          >
                            Télécharger
                          </a>
                        )}
                        <DocumentActions documentId={doc.id} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {documents.filter((d: any) => d.pfe_project_id == null).length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Documents de l&apos;encadrant</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.filter((d: any) => d.pfe_project_id == null).map((doc: any, index: number) => (
                  <div
                    key={doc.id || index}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                        {getFileIcon(getFileType(doc.file_name || doc.name || ''))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 font-semibold text-lg mb-1 truncate">{doc.file_name || doc.name || 'Document'}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{getFileType(doc.file_name || doc.name || '')}</span>
                          <span>•</span>
                          <span>{doc.file_size ? formatFileSize(doc.file_size) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Partagé par {doc.uploader?.full_name || 'Encadrant'} • {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                    </p>
                    {doc.file_path && (
                      <a
                        href={doc.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900"
                      >
                        Télécharger
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {documents.length === 0 && (
            <div className="relative bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xl">
              <p className="text-gray-600 text-lg">Aucun document. Téléversez un fichier pour partager votre avancement avec votre encadrant.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
