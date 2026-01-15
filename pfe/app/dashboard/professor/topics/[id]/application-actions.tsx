'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ApplicationActions({ applicationId, topicId }: { applicationId: string; topicId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(status: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/professor/topics/${topicId}/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating application:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 mt-4">
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
        className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold text-sm disabled:opacity-50"
      >
        Rejeter
      </button>
    </div>
  )
}
