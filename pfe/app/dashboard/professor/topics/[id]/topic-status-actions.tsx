'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function TopicStatusActions({ topicId }: { topicId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStatus(status: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/professor/topics/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => handleStatus('approved')}
        disabled={loading}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-sm disabled:opacity-50"
      >
        Approuver
      </button>
      <button
        type="button"
        onClick={() => handleStatus('rejected')}
        disabled={loading}
        className="px-4 py-2 bg-red-600/20 border border-red-200 text-red-700 rounded-lg hover:bg-red-600/30 font-semibold text-sm disabled:opacity-50"
      >
        Rejeter
      </button>
    </div>
  )
}
