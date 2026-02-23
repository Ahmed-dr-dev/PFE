'use client'

import { useState } from 'react'

export default function CreateAccountPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedRole, setSelectedRole] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

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

    const body: Record<string, unknown> = {
      email,
      password,
      fullName,
      role,
      department: department || null,
      phone: phone || null,
    }

    if (role === 'student' && year) body.year = year
    if (role === 'professor') {
      if (office) body.office = office
      if (officeHours) body.officeHours = officeHours
      if (bio) body.bio = bio
      if (expertise) body.expertise = expertise.split(',').map((s: string) => s.trim()).filter(Boolean)
    }

    try {
      const res = await fetch('/api/admin/users', {
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

      setSuccess(`Compte créé : ${data.user?.full_name} (${data.user?.email}). Vous pouvez communiquer ces identifiants à l'utilisateur.`)
      ;(e.target as HTMLFormElement).reset()
      setSelectedRole('')
    } catch {
      setError('Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Créer un compte</span>
        </h1>
        <p className="text-gray-400 text-lg">Créer un compte étudiant ou enseignant et leur communiquer les identifiants</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Rôle</label>
                <select
                  name="role"
                  required
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="">Sélectionnez le rôle</option>
                  <option value="student">Étudiant</option>
                  <option value="professor">Enseignant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Nom complet</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  placeholder="Nom complet"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  placeholder="email@isaeg.ma"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Téléphone</label>
                <input
                  name="phone"
                  type="tel"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>

              {selectedRole === 'student' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Année</label>
                  <select
                    name="year"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="3ème année">3ème année</option>
                    <option value="4ème année">4ème année</option>
                    <option value="5ème année">5ème année</option>
                  </select>
                </div>
              )}

              {selectedRole === 'professor' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Département</label>
                    <select
                      name="department"
                      required
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="informatique">Informatique</option>
                      <option value="gestion">Gestion</option>
                      <option value="finance">Finance</option>
                      <option value="marketing">Marketing</option>
                      <option value="rh">Ressources Humaines</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Bureau</label>
                    <input
                      name="office"
                      type="text"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                      placeholder="Ex: Bureau 205"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Heures de bureau</label>
                    <input
                      name="officeHours"
                      type="text"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                      placeholder="Ex: Lundi-Vendredi 14h-16h"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Biographie</label>
                    <textarea
                      name="bio"
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                      placeholder="Brève description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Domaines d&apos;expertise (virgules)</label>
                    <input
                      name="expertise"
                      type="text"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                      placeholder="Ex: IA, Web, Base de données"
                    />
                  </div>
                </>
              )}

              {selectedRole === 'student' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Département (optionnel)</label>
                  <select
                    name="department"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="informatique">Informatique</option>
                    <option value="gestion">Gestion</option>
                    <option value="finance">Finance</option>
                    <option value="marketing">Marketing</option>
                    <option value="rh">Ressources Humaines</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Mot de passe (à communiquer à l&apos;utilisateur)</label>
                <input
                  name="password"
                  type="text"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  placeholder="Min. 6 caractères"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Création...' : 'Créer le compte'}
          </button>
        </form>
      </div>
    </div>
  )
}
