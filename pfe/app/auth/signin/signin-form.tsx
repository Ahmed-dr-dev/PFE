'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SignInForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue')
        setLoading(false)
        return
      }

      // Redirect based on user role
      if (data.user?.role) {
        const role = data.user.role
        if (role === 'student') {
          router.push('/dashboard/student')
        } else if (role === 'professor') {
          router.push('/dashboard/professor')
        } else if (role === 'admin') {
          router.push('/dashboard/admin')
        } else {
          router.push('/dashboard')
        }
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch (err) {
      setError('Erreur de connexion')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          CIN / Email
        </label>
        <input
          id="email"
          name="email"
          type="text"
          required
          autoComplete="username"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900 placeholder:text-gray-500"
          placeholder="CIN, email ou identifiant"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900 placeholder:text-gray-500"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-emerald-500/50"
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}

