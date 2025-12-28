'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SignUpForm() {
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
    const fullName = formData.get('fullName') as string
    const role = formData.get('role') as string
    const studentId = formData.get('studentId') as string
    const department = formData.get('department') as string
    const phone = formData.get('phone') as string

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role, studentId, department, phone }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('Erreur lors de l\'inscription')
      setLoading(false)
    }
  }

  const [selectedRole, setSelectedRole] = useState('')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-200 mb-1">
          Nom complet
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white placeholder:text-gray-400 backdrop-blur-sm"
          placeholder="Votre nom complet"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white placeholder:text-gray-400 backdrop-blur-sm"
          placeholder="votre.email@isaeg.ma"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-1">
          Téléphone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white placeholder:text-gray-400 backdrop-blur-sm"
          placeholder="+212 6XX XXX XXX"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-200 mb-1">
          Rôle
        </label>
        <select
          id="role"
          name="role"
          required
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white backdrop-blur-sm"
        >
          <option value="" className="bg-slate-900">Sélectionnez votre rôle</option>
          <option value="student" className="bg-slate-900">Étudiant</option>
          <option value="teacher" className="bg-slate-900">Enseignant</option>
          <option value="admin" className="bg-slate-900">Administration</option>
        </select>
      </div>

      {selectedRole === 'student' && (
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-200 mb-1">
            Numéro d'étudiant
          </label>
          <input
            id="studentId"
            name="studentId"
            type="text"
            required
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white placeholder:text-gray-400 backdrop-blur-sm"
            placeholder="Ex: 2024001"
          />
        </div>
      )}

      {(selectedRole === 'teacher' || selectedRole === 'admin') && (
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-200 mb-1">
            Département
          </label>
          <select
            id="department"
            name="department"
            required
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white backdrop-blur-sm"
          >
            <option value="" className="bg-slate-900">Sélectionnez</option>
            <option value="informatique" className="bg-slate-900">Informatique</option>
            <option value="gestion" className="bg-slate-900">Gestion</option>
            <option value="finance" className="bg-slate-900">Finance</option>
            <option value="marketing" className="bg-slate-900">Marketing</option>
            <option value="rh" className="bg-slate-900">Ressources Humaines</option>
          </select>
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white placeholder:text-gray-400 backdrop-blur-sm"
          placeholder="Min. 6 caractères"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-emerald-500/50"
      >
        {loading ? 'Inscription...' : 'S\'inscrire'}
      </button>
    </form>
  )
}

