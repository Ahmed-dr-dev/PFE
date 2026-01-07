'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (error) {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="px-4 py-2 bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/50 text-red-200 rounded-xl hover:from-red-600/30 hover:to-red-700/30 transition-all duration-200 font-semibold text-sm disabled:opacity-50 shadow-lg hover:shadow-xl hover:shadow-red-500/20"
    >
      {loading ? 'Déconnexion...' : 'Déconnexion'}
    </button>
  )
}


