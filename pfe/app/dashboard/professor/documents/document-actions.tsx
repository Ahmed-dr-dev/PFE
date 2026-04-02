'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DocumentActions({
  documentId,
  onDeleted,
  label,
}: {
  documentId: string
  /** Client pages: refetch list after delete (router.refresh() alone does not update useEffect state). */
  onDeleted?: () => void | Promise<void>
  label?: string
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/professor/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await onDeleted?.()
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      type="button"
      title="Supprimer"
      onClick={handleDelete}
      disabled={deleting}
      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-semibold text-red-700 transition-all duration-200 disabled:opacity-50"
    >
      {deleting ? (
        <svg className="w-4 h-4 animate-spin shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
      {label && <span>{deleting ? '…' : label}</span>}
    </button>
  )
}
