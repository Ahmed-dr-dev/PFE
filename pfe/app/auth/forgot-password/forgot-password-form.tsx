'use client'

import Link from 'next/link'
import { useState } from 'react'

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [noMailWarning, setNoMailWarning] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    setNoMailWarning('')
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '').trim()
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const parts = [data.error, data.brevoDetail].filter(Boolean)
        setError(parts.length ? parts.join(' — ') : 'Une erreur est survenue')
        setLoading(false)
        return
      }
      if (data.sent === false && data.message) {
        setNoMailWarning(data.message)
        return
      }
      setMessage(data.message || 'Si un compte existe, un e-mail a été envoyé.')
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-medium">{error}</div>
      )}
      {noMailWarning && (
        <div className="bg-amber-50 border border-amber-300 text-amber-950 px-4 py-3 rounded-lg text-sm font-medium">
          {noMailWarning}
        </div>
      )}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-lg text-sm font-medium">
          {message}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          CIN / E-mail (identifiant de connexion)
        </label>
        <input
          id="email"
          name="email"
          type="text"
          required
          autoComplete="username"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
          placeholder="Comme sur la page de connexion"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-cyan-700 font-semibold disabled:opacity-50"
      >
        {loading ? 'Envoi…' : 'Envoyer le lien par e-mail'}
      </button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/auth/signin" className="font-semibold text-emerald-600 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  )
}
