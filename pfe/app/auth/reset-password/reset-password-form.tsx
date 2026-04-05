'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')?.trim() || ''

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!token) {
      setError('Lien invalide : paramètre token manquant.')
      return
    }
    const fd = new FormData(e.currentTarget)
    const password = String(fd.get('password') || '')
    const confirm = String(fd.get('confirm') || '')
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Erreur')
        setLoading(false)
        return
      }
      setMessage(data.message || 'Mot de passe mis à jour.')
      setTimeout(() => router.push('/auth/signin'), 2000)
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-red-700 text-sm font-medium">Ce lien est incomplet ou expiré.</p>
        <Link href="/auth/forgot-password" className="inline-block text-emerald-600 font-semibold hover:underline">
          Demander un nouvel e-mail
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-medium">{error}</div>
      )}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-lg text-sm font-medium">
          {message}
          <p className="mt-2 text-xs font-normal">Redirection vers la connexion…</p>
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Nouveau mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-2">
          Confirmer le mot de passe
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !!message}
        className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-cyan-700 font-semibold disabled:opacity-50"
      >
        {loading ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
      </button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/auth/signin" className="font-semibold text-emerald-600 hover:underline">
          Connexion
        </Link>
      </p>
    </form>
  )
}
