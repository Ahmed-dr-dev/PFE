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
    const department = formData.get('department') as string
    const phone = formData.get('phone') as string
    const year = formData.get('year') as string
    const office = formData.get('office') as string
    const officeHours = formData.get('officeHours') as string
    const bio = formData.get('bio') as string
    const expertise = formData.get('expertise') as string

    // Build request body
    const body: any = {
      email,
      password,
      fullName,
      role,
      department: department || null,
      phone: phone || null,
    }

    // Add role-specific fields
    if (role === 'student' && year) {
      body.year = year
    }

    if (role === 'professor') {
      if (office) body.office = office
      if (officeHours) body.officeHours = officeHours
      if (bio) body.bio = bio
      if (expertise) {
        body.expertise = expertise.split(',').map((e: string) => e.trim()).filter(Boolean)
      }
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue')
        setLoading(false)
        return
      }

      // Redirect based on role
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
          <option value="professor" className="bg-slate-900">Enseignant</option>
          <option value="admin" className="bg-slate-900">Administration</option>
        </select>
      </div>

      {selectedRole === 'student' && (
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-200 mb-1">
            Année
          </label>
          <select
            id="year"
            name="year"
            required
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white backdrop-blur-sm"
          >
            <option value="" className="bg-slate-900">Sélectionnez</option>
            <option value="3ème année" className="bg-slate-900">3ème année</option>
            <option value="4ème année" className="bg-slate-900">4ème année</option>
            <option value="5ème année" className="bg-slate-900">5ème année</option>
          </select>
        </div>
      )}

      {selectedRole === 'professor' && (
        <>
          <div>
            <label htmlFor="office" className="block text-sm font-medium text-gray-200 mb-1">
              Bureau
            </label>
            <input
              id="office"
              name="office"
              type="text"
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white placeholder:text-gray-400 backdrop-blur-sm"
              placeholder="Ex: Bureau 205, Bâtiment A"
            />
          </div>
          <div>
            <label htmlFor="officeHours" className="block text-sm font-medium text-gray-200 mb-1">
              Heures de bureau
            </label>
            <input
              id="officeHours"
              name="officeHours"
              type="text"
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white placeholder:text-gray-400 backdrop-blur-sm"
              placeholder="Ex: Lundi-Vendredi 14h-16h"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-200 mb-1">
              Biographie
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white placeholder:text-gray-400 backdrop-blur-sm resize-none"
              placeholder="Brève description de votre parcours..."
            />
          </div>
          <div>
            <label htmlFor="expertise" className="block text-sm font-medium text-gray-200 mb-1">
              Domaines d'expertise (séparés par des virgules)
            </label>
            <input
              id="expertise"
              name="expertise"
              type="text"
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white placeholder:text-gray-400 backdrop-blur-sm"
              placeholder="Ex: Machine Learning, Web Development, Database"
            />
          </div>
        </>
      )}

      {(selectedRole === 'professor' || selectedRole === 'admin') && (
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

