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
      className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition-all duration-200 font-semibold text-sm disabled:opacity-50"
    >
      {loading ? 'Déconnexion...' : 'Déconnexion'}
    </button>
  )
}

