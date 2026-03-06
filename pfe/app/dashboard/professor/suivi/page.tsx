'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { UploadButton } from '../documents/upload-button'

export default function ProfessorSuiviListPage() {
  const [students, setStudents] = useState<any[]>([])
  const [publicDocuments, setPublicDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsRes, docsRes] = await Promise.all([
          fetch('/api/professor/students', { cache: 'no-store' }),
          fetch('/api/professor/documents', { cache: 'no-store' }),
        ])
        if (studentsRes.ok) {
          const data = await studentsRes.json()
          setStudents(data.students || [])
        }
        if (docsRes.ok) {
          const data = await docsRes.json()
          setPublicDocuments(data.publicDocuments || [])
        }
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="relative bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xl">
        <p className="text-gray-600 text-lg">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
          Suivi <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">par étudiant</span>
        </h1>
        <p className="text-gray-600 text-lg">
          Cliquez sur un étudiant pour voir son avancement, ses documents et lui laisser des remarques ou notes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((s) => (
          <Link
            key={s.id}
            href={`/dashboard/professor/suivi/${s.id}`}
            className="group block bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-200 flex items-center justify-center shrink-0 group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 transition-colors">
                <span className="text-lg font-bold text-emerald-700">
                  {(s.full_name || 'É')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-900 font-semibold truncate">{s.full_name || 'Étudiant'}</h2>
                {s.email && <p className="text-gray-500 text-sm truncate">{s.email}</p>}
                {s.department && <p className="text-gray-400 text-xs mt-0.5">{s.department}</p>}
                {s.topic?.title && (
                  <p className="text-emerald-600 text-xs font-medium mt-2 truncate" title={s.topic.title}>
                    {s.topic.title}
                  </p>
                )}
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {students.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-600">Aucun étudiant encadré pour le moment.</p>
        </div>
      )}

      {students.length > 0 && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">Documents partagés avec tous les étudiants</h2>
            <UploadButton />
          </div>
          <div className="p-6">
            {publicDocuments.length > 0 ? (
              <ul className="space-y-2">
                {publicDocuments.map((doc: any) => (
                  <li key={doc.id} className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-900 font-medium truncate">{doc.name}</span>
                    {doc.file_path && (
                      <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium shrink-0">
                        Télécharger
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Aucun document partagé. Utilisez le bouton ci-dessus pour en ajouter.</p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
