'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function TopicActions({ topicId }: { topicId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(status: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/topics/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating topic:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => handleStatusChange('approved')}
        disabled={loading}
        className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm disabled:opacity-50"
      >
        Approuver le sujet
      </button>
      <button
        onClick={() => handleStatusChange('rejected')}
        disabled={loading}
        className="w-full px-4 py-3 bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/50 text-red-200 rounded-lg hover:from-red-600/30 hover:to-red-700/30 transition-all duration-200 font-semibold text-sm disabled:opacity-50"
      >
        Rejeter le sujet
      </button>
    </div>
  )
}
