'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { DocumentActions } from '../../documents/document-actions'

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE'
  return ext
}

function DocCard({
  doc,
  onStatusChange,
  onReviewChange,
}: {
  doc: any
  onStatusChange?: (id: string, status: string) => void
  onReviewChange?: (id: string, professor_review: string | null) => void
}) {
  const [updating, setUpdating] = useState(false)
  const [reviewText, setReviewText] = useState(doc.professor_review || '')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const isPending = doc.status === 'pending'

  const handleStatus = async (status: 'approved' | 'rejected') => {
    if (!onStatusChange) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/professor/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) onStatusChange(doc.id, status)
    } finally {
      setUpdating(false)
    }
  }

  const handleSubmitReview = async () => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/professor/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professor_review: reviewText || null }),
      })
      if (res.ok) {
        onReviewChange?.(doc.id, reviewText || null)
        setShowReviewForm(false)
      }
    } finally {
      setUpdating(false)
    }
  }

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
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-200 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
          {getFileIcon(getFileType(doc.name || ''))}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-gray-900 font-semibold text-sm truncate">{doc.name || 'Document'}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap mt-1">
            <span>{getFileType(doc.name || '')}</span>
            <span>•</span>
            <span>{doc.file_size ? formatFileSize(doc.file_size) : 'N/A'}</span>
            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{doc.category || 'Autre'}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={`px-2 py-1 rounded-lg text-xs font-semibold ${
            doc.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : doc.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {doc.status === 'approved' ? 'Vu' : doc.status === 'rejected' ? 'Refusé' : 'En attente'}
        </span>
        <span className="text-xs text-gray-500">
          {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('fr-FR') : ''}
        </span>
      </div>

      {(doc.professor_review || showReviewForm) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-700 mb-1">Correction / Avis</p>
          {showReviewForm ? (
            <div className="space-y-2">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Corrections ou remarques pour l'étudiant..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleSubmitReview}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  Envoyer
                </button>
                <button
                  type="button"
                  onClick={() => { setShowReviewForm(false); setReviewText(doc.professor_review || ''); }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-2">{doc.professor_review}</p>
              <button type="button" onClick={() => setShowReviewForm(true)} className="mt-1 text-xs font-medium text-emerald-600 hover:text-emerald-700">
                Modifier
              </button>
            </>
          )}
        </div>
      )}
      {!doc.professor_review && !showReviewForm && (
        <div className="mt-2">
          <button type="button" onClick={() => setShowReviewForm(true)} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
            + Ajouter une correction / avis
          </button>
        </div>
      )}

      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        {doc.file_path && (
          <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 text-center">
            Télécharger
          </a>
        )}
        {isPending ? (
          <>
            <button type="button" disabled={updating} onClick={() => handleStatus('approved')} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50">
              Valider
            </button>
            <button type="button" disabled={updating} onClick={() => handleStatus('rejected')} className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 disabled:opacity-50">
              Refuser
            </button>
          </>
        ) : (
          <DocumentActions documentId={doc.id} />
        )}
      </div>
    </div>
  )
}

export default function ProfessorSuiviStudentPage() {
  const params = useParams()
  const studentId = params.studentId as string
  const [data, setData] = useState<{ student: any; project: any; topic: any; documents: any[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesEditing, setNotesEditing] = useState(false)

  useEffect(() => {
    if (!studentId) return
    async function fetchData() {
      try {
        const res = await fetch(`/api/professor/suivi/${studentId}`, { cache: 'no-store' })
        if (res.ok) {
          const d = await res.json()
          setData(d)
          setNotes(d.project?.supervisor_notes || '')
        }
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [studentId])

  const handleSaveNotes = async () => {
    setNotesSaving(true)
    try {
      const res = await fetch(`/api/professor/suivi/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supervisor_notes: notes }),
      })
      if (res.ok) setNotesEditing(false)
    } finally {
      setNotesSaving(false)
    }
  }

  const handleDocStatusChange = (docId: string, status: string) => {
    if (!data) return
    setData({
      ...data,
      documents: data.documents.map((d: any) => (d.id === docId ? { ...d, status } : d)),
    })
  }

  const handleDocReviewChange = (docId: string, professor_review: string | null) => {
    if (!data) return
    setData({
      ...data,
      documents: data.documents.map((d: any) => (d.id === docId ? { ...d, professor_review } : d)),
    })
  }

  if (loading) {
    return (
      <div className="relative bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xl">
        <p className="text-gray-600 text-lg">Chargement...</p>
      </div>
    )
  }

  if (!data || !data.student) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/professor/suivi" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
          ← Retour au suivi
        </Link>
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-600">Étudiant non trouvé.</p>
        </div>
      </div>
    )
  }

  const { student, project, topic, documents } = data

  return (
    <div className="space-y-8">
      <Link href="/dashboard/professor/suivi" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Retour à la liste
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{student.full_name || 'Étudiant'}</h1>
          {student.email && <p className="text-gray-600 text-sm">{student.email}</p>}
          {student.department && <p className="text-gray-500 text-xs">{student.department}</p>}
          {topic?.title && <p className="text-emerald-600 text-sm font-medium mt-1">Sujet : {topic.title}</p>}
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Note / Remarques pour l&apos;étudiant</h2>
            {notesEditing ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Remarques générales, axes d'amélioration, points d'attention..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={notesSaving}
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {notesSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button type="button" onClick={() => { setNotesEditing(false); setNotes(data.project?.supervisor_notes || ''); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                {project?.supervisor_notes ? (
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">{project.supervisor_notes}</p>
                ) : (
                  <p className="text-gray-500 text-sm italic">Aucune note pour le moment.</p>
                )}
                <button type="button" onClick={() => setNotesEditing(true)} className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                  {project?.supervisor_notes ? 'Modifier la note' : 'Ajouter une note'}
                </button>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Documents et avancement</h2>
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc: any) => (
                  <DocCard
                    key={doc.id}
                    doc={doc}
                    onStatusChange={handleDocStatusChange}
                    onReviewChange={handleDocReviewChange}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Aucun document partagé par cet étudiant pour le moment.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
