'use client'

import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    department: '',
    year: '',
  })

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/student/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile(data.profile)
          setFormData({
            full_name: data.profile?.full_name || '',
            phone: data.profile?.phone || '',
            department: data.profile?.department || '',
            year: data.profile?.year || '',
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
        alert('Profil mis à jour avec succès')
      } else {
        const error = await res.json()
        alert(error.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  const departments = ['informatique', 'gestion', 'finance', 'marketing', 'rh', 'comptabilite']
  const years = ['1', '2', '3', '4', '5']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Profil</span>
        </h1>
        <p className="text-gray-400 text-lg">Gérez vos informations personnelles</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Informations personnelles</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="Votre nom complet"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="Votre numéro de téléphone"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Département
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  <option value="">Sélectionner un département</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept.charAt(0).toUpperCase() + dept.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Année d'étude
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  <option value="">Sélectionner une année</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}ère année
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
