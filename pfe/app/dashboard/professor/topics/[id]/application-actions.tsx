'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ApplicationActions({ applicationId, topicId }: { applicationId: string; topicId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleStatusChange(status: string) {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch(`/api/professor/topics/${topicId}/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const data = await res.json()
        setSuccess(true)
        setTimeout(() => {
          router.refresh()
        }, 1000)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating application:', error)
      setError('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
          Mise à jour réussie
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleStatusChange('approved')}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm disabled:opacity-50"
        >
          Approuver
        </button>
        <button
          onClick={() => handleStatusChange('rejected')}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold text-sm disabled:opacity-50"
        >
          Rejeter
        </button>
      </div>
    </div>
  )
}
