'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { UploadButton } from '../documents/upload-button'
import { DocumentActions } from '../documents/document-actions'

export default function ProfessorSuiviListPage() {
  const [students, setStudents] = useState<any[]>([])
  const [publicDocuments, setPublicDocuments] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Announce modal state
  const [showAnnounce, setShowAnnounce] = useState(false)
  const [annTitle, setAnnTitle] = useState('')
  const [annContent, setAnnContent] = useState('')
  const [annAudience, setAnnAudience] = useState<'students' | 'all'>('students')
  const [annSaving, setAnnSaving] = useState(false)
  const [annError, setAnnError] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)

  async function refreshDocuments() {
    try {
      const docsRes = await fetch('/api/professor/documents', { cache: 'no-store' })
      if (docsRes.ok) {
        const data = await docsRes.json()
        setPublicDocuments(data.publicDocuments || [])
      }
    } catch { /* ignore */ }
  }

  async function refreshAnnouncements() {
    try {
      const res = await fetch('/api/professor/announcements', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements || [])
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsRes, docsRes, annRes] = await Promise.all([
          fetch('/api/professor/students', { cache: 'no-store' }),
          fetch('/api/professor/documents', { cache: 'no-store' }),
          fetch('/api/professor/announcements', { cache: 'no-store' }),
        ])
        if (studentsRes.ok) setStudents((await studentsRes.json()).students || [])
        if (docsRes.ok) setPublicDocuments((await docsRes.json()).publicDocuments || [])
        if (annRes.ok) setAnnouncements((await annRes.json()).announcements || [])
      } catch { /* ignore */ } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handlePublishAnnounce() {
    if (!annTitle.trim() || !annContent.trim()) {
      setAnnError('Le titre et le contenu sont requis.')
      return
    }
    setAnnSaving(true)
    setAnnError('')
    try {
      const res = await fetch('/api/professor/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: annTitle, content: annContent, target_audience: annAudience }),
      })
      if (res.ok) {
        setShowAnnounce(false)
        setAnnTitle('')
        setAnnContent('')
        setAnnAudience('students')
        await refreshAnnouncements()
      } else {
        const d = await res.json()
        setAnnError(d.error || 'Erreur lors de la publication')
      }
    } finally {
      setAnnSaving(false)
    }
  }

  async function handleDeleteAnnounce(id: string) {
    if (!confirm('Supprimer cette annonce ?')) return
    await fetch(`/api/professor/announcements/${id}`, { method: 'DELETE' })
    await refreshAnnouncements()
  }

  function openAnnounce() {
    setAnnError('')
    setShowAnnounce(true)
    setTimeout(() => titleRef.current?.focus(), 50)
  }

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

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Documents partagés avec tous les étudiants</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {publicDocuments.length} document{publicDocuments.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={openAnnounce}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              Publier une annonce
            </button>
            <UploadButton onUploadSuccess={refreshDocuments} />
          </div>
        </div>
        <div className="p-6">
          {publicDocuments.length > 0 ? (
            <ul className="space-y-2">
              {publicDocuments.map((doc: any) => (
                <li
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-900 font-medium truncate min-w-0 flex-1">{doc.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {doc.file_path && (
                      <a
                        href={doc.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-sm text-emerald-700 font-semibold border border-emerald-200 rounded-lg hover:bg-emerald-50"
                      >
                        Télécharger
                      </a>
                    )}
                    <DocumentActions documentId={doc.id} onDeleted={refreshDocuments} label="Supprimer" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Aucun document partagé. Utilisez le bouton ci-dessus pour en ajouter.</p>
          )}
        </div>
      </section>

      {/* ── Mes annonces ── */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Mes annonces publiées</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-violet-100 text-violet-800 border border-violet-200">
            {announcements.length} annonce{announcements.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="p-6">
          {announcements.length > 0 ? (
            <ul className="space-y-3">
              {announcements.map((ann: any) => (
                <li key={ann.id} className="flex flex-wrap items-start justify-between gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-violet-50/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{ann.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${ann.target_audience === 'all' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-violet-50 text-violet-700 border-violet-200'}`}>
                        {ann.target_audience === 'all' ? 'Tous' : 'Étudiants'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(ann.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">{ann.content}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAnnounce(ann.id)}
                    className="shrink-0 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Aucune annonce publiée. Cliquez sur « Publier une annonce » pour commencer.</p>
          )}
        </div>
      </section>

      {/* ── Modal annonce ── */}
      {showAnnounce && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Publier une annonce</h3>
              <button type="button" onClick={() => setShowAnnounce(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Titre <span className="text-red-500">*</span></label>
                <input
                  ref={titleRef}
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Ex. : Rappel date de rendu du rapport..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contenu <span className="text-red-500">*</span></label>
                <textarea
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Message à envoyer à vos étudiants..."
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Destinataires</label>
                <div className="flex gap-3">
                  <label className={`flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${annAudience === 'students' ? 'bg-violet-50 border-violet-400' : 'border-gray-200 hover:border-violet-300'}`}>
                    <input type="radio" name="audience" value="students" checked={annAudience === 'students'} onChange={() => setAnnAudience('students')} className="accent-violet-600" />
                    <span className="text-sm font-medium text-gray-900">Mes étudiants</span>
                  </label>
                  <label className={`flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${annAudience === 'all' ? 'bg-violet-50 border-violet-400' : 'border-gray-200 hover:border-violet-300'}`}>
                    <input type="radio" name="audience" value="all" checked={annAudience === 'all'} onChange={() => setAnnAudience('all')} className="accent-violet-600" />
                    <span className="text-sm font-medium text-gray-900">Tous</span>
                  </label>
                </div>
              </div>
              {annError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{annError}</p>}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowAnnounce(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">
                Annuler
              </button>
              <button
                type="button"
                disabled={annSaving}
                onClick={handlePublishAnnounce}
                className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl disabled:opacity-50 transition-colors"
              >
                {annSaving ? 'Publication...' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
