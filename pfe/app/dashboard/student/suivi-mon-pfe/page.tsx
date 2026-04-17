'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { SuiviUploadButton } from '../suivi/upload-button'
import { DocumentActions } from '../documents/document-actions'

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function getFileType(fileName: string): string {
  return fileName.split('.').pop()?.toUpperCase() || 'FILE'
}

function parseMeetingDate(m: { date?: string; meeting_date?: string }): Date | null {
  const d = m.date || m.meeting_date
  if (!d) return null
  const dt = new Date(d)
  return Number.isNaN(dt.getTime()) ? null : dt
}

function isUpcomingMeeting(m: { date?: string; meeting_date?: string }): boolean {
  const dt = parseMeetingDate(m)
  if (!dt) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const copy = new Date(dt)
  copy.setHours(0, 0, 0, 0)
  return copy >= today
}

function isRecentMeeting(m: { created_at?: string }): boolean {
  if (!m.created_at) return false
  return Date.now() - new Date(m.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-purple-500/20 text-purple-200 border-purple-500/50',
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  in_progress: 'En cours',
  completed: 'Terminé',
}

function computeProgress(pfe: any): number {
  if (pfe.progress != null) return Math.min(100, Math.max(0, Number(pfe.progress)))
  let score = 0
  const st = pfe.status
  if (st === 'approved' || st === 'in_progress' || st === 'completed') score += 25
  if (pfe.app_validated) score += 25
  if (pfe.rapport_validated) score += 25
  if (pfe.soutenance_validated || st === 'completed') score += 25
  return score
}

function LoadingBlock() {
  return (
    <div className="space-y-8">
      <div className="relative bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xl">
        <p className="text-gray-600 text-lg">Chargement...</p>
      </div>
    </div>
  )
}

function SuiviMonPfeInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showAdvancement = searchParams.get('view') === 'avancement'

  const [myPfe, setMyPfe] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [meetings, setMeetings] = useState<any[]>([])
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [docsLoading, setDocsLoading] = useState(false)

  const refreshCore = useCallback(async () => {
    try {
      const [pfeRes, meetingsRes, msgRes] = await Promise.all([
        fetch('/api/student/my-pfe', { cache: 'no-store' }),
        fetch('/api/student/meetings', { cache: 'no-store' }),
        fetch('/api/messages', { cache: 'no-store' }),
      ])
      if (pfeRes.ok) {
        const d = await pfeRes.json()
        setMyPfe(d.pfe)
      }
      if (meetingsRes.ok) {
        const d = await meetingsRes.json()
        setMeetings(d.meetings || [])
      }
      if (msgRes.ok) {
        const d = await msgRes.json()
        const conv = d.conversations || []
        setTotalUnreadMessages(conv.reduce((s: number, c: { unread_count?: number }) => s + (c.unread_count || 0), 0))
      }
    } catch {
      /* ignore */
    }
  }, [])

  const refreshDocuments = useCallback(async () => {
    try {
      const docRes = await fetch('/api/student/documents', { cache: 'no-store' })
      if (docRes.ok) {
        const d = await docRes.json()
        setDocuments(d.documents || [])
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      await refreshCore()
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [refreshCore])

  useEffect(() => {
    if (!showAdvancement) return
    let cancelled = false
    ;(async () => {
      setDocsLoading(true)
      await refreshDocuments()
      if (!cancelled) setDocsLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [showAdvancement, refreshDocuments])

  const upcomingMeetings = meetings.filter(isUpcomingMeeting)
  const recentMeetingsCount = meetings.filter(isRecentMeeting).length
  const myDocs = documents.filter((d: any) => d.pfe_project_id != null)
  const profDocs = documents.filter((d: any) => d.pfe_project_id == null)
  const supervisorNotes = myPfe?.supervisor_notes || null

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

  const openAdvancement = () => {
    router.push('/dashboard/student/suivi-mon-pfe?view=avancement')
  }

  const closeAdvancement = () => {
    router.push('/dashboard/student/suivi-mon-pfe')
  }

  if (loading) {
    return <LoadingBlock />
  }

  const hasNotifs = totalUnreadMessages > 0 || upcomingMeetings.length > 0 || recentMeetingsCount > 0

  /* ——— Vue avancement (sujet ouvert) ——— */
  if (showAdvancement && myPfe) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            type="button"
            onClick={closeAdvancement}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-sm w-fit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au suivi
          </button>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Avancement —{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{myPfe.topic?.title || 'Mon PFE'}</span>
          </h1>
          <p className="text-gray-600">Détail du projet, progression et documents partagés avec votre encadrant.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span
            className={`inline-flex w-fit px-4 py-2 rounded-xl text-sm font-semibold border ${
              statusColors[myPfe.status] || statusColors.pending
            }`}
          >
            {statusLabels[myPfe.status] || 'Inconnu'}
          </span>
          <SuiviUploadButton onUploadSuccess={refreshDocuments} />
        </div>

        <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative space-y-6">
            {myPfe.topic?.description && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{myPfe.topic.description}</p>
              </div>
            )}
            {myPfe.topic?.requirements && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Prérequis</p>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{myPfe.topic.requirements}</p>
              </div>
            )}
            {(() => {
              const pct = computeProgress(myPfe)
              const milestones = [
                { label: 'Affectation', done: myPfe.status === 'approved' || myPfe.status === 'in_progress' || myPfe.status === 'completed', pct: 25 },
                { label: 'Application', done: !!myPfe.app_validated, pct: 50 },
                { label: 'Rapport', done: !!myPfe.rapport_validated, pct: 75 },
                { label: 'Soutenance', done: !!myPfe.soutenance_validated || myPfe.status === 'completed', pct: 100 },
              ]
              return (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progression du projet</p>
                    <span className={`text-lg font-extrabold ${pct === 100 ? 'text-emerald-600' : 'text-gray-900'}`}>{pct}%</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-100 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-4 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {/* milestone dots on the bar */}
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                      {milestones.map((m) => (
                        <div
                          key={m.label}
                          className="absolute -translate-x-1/2"
                          style={{ left: `${m.pct}%` }}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${m.done ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* milestone labels */}
                  <div className="flex mt-3">
                    {milestones.map((m) => (
                      <div key={m.label} className="flex-1 text-center" style={{ maxWidth: '25%' }}>
                        <p className={`text-xs font-semibold truncate ${m.done ? 'text-emerald-600' : 'text-gray-400'}`}>{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 text-sm">
              {myPfe.start_date && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date de début</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(myPfe.start_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
              {myPfe.updated_at && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Dernière mise à jour</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(myPfe.updated_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Étapes du projet</h3>
            <div className="space-y-3">
              {(['pending', 'approved', 'in_progress', 'completed'] as const).map((st) => (
                <div key={st} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      myPfe.status === st ? 'bg-emerald-500 shadow shadow-emerald-500/40' : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-sm text-gray-800 font-medium">{statusLabels[st]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Encadrement</h3>
            {myPfe.supervisor ? (
              <div className="space-y-3 text-sm">
                <p className="text-gray-900 font-semibold text-lg">{myPfe.supervisor.full_name}</p>
                {myPfe.supervisor.email && (
                  <a href={`mailto:${myPfe.supervisor.email}`} className="text-emerald-600 font-medium block">
                    {myPfe.supervisor.email}
                  </a>
                )}
                {myPfe.supervisor.phone && (
                  <a href={`tel:${myPfe.supervisor.phone}`} className="text-gray-700 block">
                    {myPfe.supervisor.phone}
                  </a>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Aucun encadrant assigné pour le moment.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Réunions à venir</h3>
            <Link href="/dashboard/student/meetings" className="text-sm font-semibold text-emerald-600 hover:underline">
              Tout voir
            </Link>
          </div>
          {upcomingMeetings.length === 0 ? (
            <p className="text-gray-600 text-sm">Aucune réunion à venir.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingMeetings.slice(0, 8).map((m) => {
                const dt = parseMeetingDate(m)
                return (
                  <li key={m.id} className="text-sm border border-gray-100 rounded-xl p-3 bg-gray-50/80">
                    <p className="font-semibold text-gray-900">
                      {dt
                        ? dt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Date à confirmer'}
                      {m.time ? ` · ${m.time}` : ''}
                    </p>
                    {(m.type || m.notes) && (
                      <p className="text-gray-600 text-xs mt-1">
                        {m.type || ''}
                        {m.type && m.notes ? ' — ' : ''}
                        {m.notes || ''}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {docsLoading ? (
          <p className="text-gray-600 text-sm">Chargement des documents…</p>
        ) : (
          <>
            {supervisorNotes && (
              <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-amber-900 mb-2">Note / remarques de votre encadrant</h2>
                <p className="text-gray-700 whitespace-pre-wrap text-sm">{supervisorNotes}</p>
              </section>
            )}

            {myDocs.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Vos partages avec l&apos;encadrant</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myDocs.map((doc: any, index: number) => (
                    <div key={doc.id || index} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-emerald-200 transition-colors shadow-lg">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                          {getFileIcon(getFileType(doc.file_name || doc.name || ''))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 font-semibold truncate">{doc.file_name || doc.name || 'Document'}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>{getFileType(doc.file_name || doc.name || '')}</span>
                            <span>•</span>
                            <span>{doc.file_size ? formatFileSize(doc.file_size) : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800">
                        {doc.category || 'Autre'}
                      </span>
                      {doc.status && (
                        <span
                          className={`ml-2 px-3 py-1 rounded-lg text-xs font-semibold ${
                            doc.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {doc.status === 'approved' ? "Vu par l'encadrant" : 'En attente'}
                        </span>
                      )}
                      <p className="text-xs text-gray-500 mt-2">Partagé le {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}</p>
                      {doc.professor_review && (
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs font-semibold text-amber-800 mb-1">Avis encadrant</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{doc.professor_review}</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-3">
                        {doc.id && (
                          <a
                            href={`/api/student/documents/${doc.id}`}
                            download={doc.name || doc.file_name || 'document'}
                            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-sm font-semibold text-center text-gray-900"
                          >
                            Télécharger
                          </a>
                        )}
                        <DocumentActions documentId={doc.id} onDeleted={refreshDocuments} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {profDocs.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Documents de l&apos;encadrant</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profDocs.map((doc: any, index: number) => (
                    <div key={doc.id || index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                          {getFileIcon(getFileType(doc.file_name || doc.name || ''))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 font-semibold truncate">{doc.file_name || doc.name || 'Document'}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {doc.uploader?.full_name || 'Encadrant'} · {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      {doc.id && (
                        <a
                          href={`/api/student/documents/${doc.id}`}
                          download={doc.name || doc.file_name || 'document'}
                          className="inline-block px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-900"
                        >
                          Télécharger
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {myDocs.length === 0 && profDocs.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-lg">
                <p className="text-gray-600 text-sm">Aucun document pour l&apos;instant. Utilisez le bouton ci-dessus pour en partager un avec votre encadrant.</p>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  if (showAdvancement && !myPfe) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={closeAdvancement} className="text-sm font-semibold text-gray-600 hover:text-gray-900">
          ← Retour au suivi
        </button>
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-lg">
          <p className="text-gray-700 mb-4">Aucun sujet assigné — impossible d&apos;afficher l&apos;avancement.</p>
          <Link href="/dashboard/student/topics" className="text-emerald-600 font-semibold hover:underline">
            Voir les sujets disponibles
          </Link>
        </div>
      </div>
    )
  }

  /* ——— Vue liste : notifications + sujet uniquement ——— */
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
          Suivi —{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Mon PFE</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          Alertes et votre sujet. Ouvrez le sujet pour consulter l&apos;avancement détaillé et les documents.
        </p>
      </div>

      {hasNotifs && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:p-5 space-y-3">
          <p className="text-sm font-bold text-emerald-900 uppercase tracking-wide">Notifications</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            {totalUnreadMessages > 0 && (
              <Link
                href="/dashboard/student/messagerie"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-900 font-semibold text-sm shadow-sm hover:bg-emerald-50 transition-colors"
              >
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs px-1.5">
                  {totalUnreadMessages}
                </span>
                message{totalUnreadMessages > 1 ? 's' : ''} non lu{totalUnreadMessages > 1 ? 's' : ''}
              </Link>
            )}
            {upcomingMeetings.length > 0 && (
              <Link
                href="/dashboard/student/meetings"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-cyan-200 text-cyan-900 font-semibold text-sm shadow-sm hover:bg-cyan-50 transition-colors"
              >
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-cyan-600 text-white text-xs px-1.5">
                  {upcomingMeetings.length}
                </span>
                réunion{upcomingMeetings.length > 1 ? 's' : ''} à venir
              </Link>
            )}
            {recentMeetingsCount > 0 && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 border border-amber-200 text-amber-900 font-medium text-sm">
                {recentMeetingsCount} réunion{recentMeetingsCount > 1 ? 's' : ''} récemment planifiée{recentMeetingsCount > 1 ? 's' : ''} (7 j.)
              </span>
            )}
          </div>
        </div>
      )}

      {!myPfe ? (
        <div className="relative bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5" />
          <div className="relative">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun sujet PFE assigné</h2>
            <p className="text-gray-600 mb-6">Lorsqu&apos;un sujet vous sera assigné, il apparaîtra ici.</p>
            <Link
              href="/dashboard/student/topics"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-semibold text-sm hover:from-emerald-700 hover:to-cyan-700"
            >
              Voir les sujets disponibles
            </Link>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openAdvancement}
          className="w-full text-left relative bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl overflow-hidden transition-all hover:border-emerald-300 hover:shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
          <div className="relative space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2 min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Votre sujet</p>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{myPfe.topic?.title || 'Sujet PFE'}</h2>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold border ${statusColors[myPfe.status] || statusColors.pending}`}>
                  {statusLabels[myPfe.status] || 'Inconnu'}
                </span>
              </div>
            </div>
            {/* Compact progress bar */}
            {(() => {
              const pct = computeProgress(myPfe)
              return (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-gray-500">Progression</p>
                    <span className="text-xs font-bold text-gray-900">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })()}
            <span className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm">
              Voir l&apos;avancement détaillé
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </button>
      )}
    </div>
  )
}

export default function SuiviMonPfePage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <SuiviMonPfeInner />
    </Suspense>
  )
}
