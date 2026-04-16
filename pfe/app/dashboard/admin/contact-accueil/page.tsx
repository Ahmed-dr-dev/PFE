'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type ContactSubmission = {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  created_at: string
}

const MAILTO_BODY_MAX = 2000

function formatContactDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function buildReplyMailto(s: ContactSubmission, draft: string) {
  const subj = s.subject?.trim() ? `Re: ${s.subject}` : 'Réponse — plateforme PFE'
  const header = draft.trim() ? `${draft.trim()}\n\n` : ''
  const footer = `---\nMessage reçu le ${formatContactDate(s.created_at)} — ${s.name} <${s.email}> :\n\n${s.message}`
  let body = `${header}${footer}`
  if (body.length > MAILTO_BODY_MAX) {
    body = `${body.slice(0, MAILTO_BODY_MAX - 20)}\n\n[…]`
  }
  return `mailto:${encodeURIComponent(s.email)}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
}

export default function AdminContactAccueilPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null)
  const [replyDraftById, setReplyDraftById] = useState<Record<string, string>>({})

  const loadContacts = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/admin/support-contact')
      const j = await res.json()
      if (!res.ok) {
        setFetchError(j.error || `Erreur ${res.status}`)
      } else {
        setContacts(Array.isArray(j.submissions) ? j.submissions : [])
      }
    } catch (e) {
      setFetchError('Impossible de joindre le serveur.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/admin"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 mb-2 inline-block"
          >
            ← Accueil admin
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Messages — formulaire d&apos;accueil</h1>
          <p className="text-gray-600 mt-2">
            Demandes envoyées depuis la page publique. Répondez via votre messagerie (aucune donnée
            supplémentaire en base).
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!loading && contacts.length > 0 && (
            <span className="text-sm font-semibold tabular-nums text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
              {contacts.length} message{contacts.length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            type="button"
            onClick={loadContacts}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6">
          {loading ? (
            <p className="text-gray-600 text-sm py-4">Chargement des messages…</p>
          ) : fetchError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Erreur : {fetchError}
            </div>
          ) : contacts.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">Aucun message pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {contacts.map((c) => {
                const open = expandedContactId === c.id
                const draft = replyDraftById[c.id] ?? ''
                return (
                  <li
                    key={c.id}
                    className="rounded-xl border border-gray-100 bg-gray-50/80 hover:bg-gray-50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedContactId(open ? null : c.id)}
                      className="w-full text-left px-4 py-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                        <p className="text-sm text-gray-600 truncate">{c.email}</p>
                        {c.subject ? (
                          <p className="text-sm text-gray-700 mt-1 font-medium truncate">{c.subject}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-500 tabular-nums">{formatContactDate(c.created_at)}</span>
                        <span className="text-xs font-semibold text-emerald-600">{open ? 'Masquer' : 'Détails'}</span>
                      </div>
                    </button>
                    {open ? (
                      <div className="px-4 pb-4 pt-0 space-y-3 border-t border-gray-100/80 mt-0">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap pt-3">{c.message}</p>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">
                            Brouillon de réponse (inséré dans l&apos;e-mail)
                          </label>
                          <textarea
                            value={draft}
                            onChange={(e) =>
                              setReplyDraftById((prev) => ({ ...prev, [c.id]: e.target.value }))
                            }
                            rows={4}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                            placeholder="Bonjour,&#10;&#10;Merci pour votre message. …"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={buildReplyMailto(c, draft)}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                          >
                            Ouvrir la messagerie
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              void navigator.clipboard?.writeText(c.email)
                            }}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-100"
                          >
                            Copier l&apos;e-mail
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
