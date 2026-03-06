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
    office: '',
    office_hours: '',
    bio: '',
    expertise: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/professor/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile(data.profile)
          setFormData({
            full_name: data.profile?.full_name || '',
            phone: data.profile?.phone || '',
            department: data.profile?.department || '',
            office: data.profile?.office || '',
            office_hours: data.profile?.office_hours || '',
            bio: data.profile?.bio || '',
            expertise: Array.isArray(data.profile?.expertise) 
              ? data.profile.expertise.join(', ') 
              : data.profile?.expertise || '',
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
      const expertiseArray = formData.expertise
        ? formData.expertise.split(',').map((e: string) => e.trim()).filter(Boolean)
        : []
      
      const res = await fetch('/api/professor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expertise: expertiseArray,
        }),
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('Les deux mots de passe ne correspondent pas')
      return
    }
    if (passwordForm.new_password.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (!passwordForm.current_password.trim()) {
      setPasswordError('Veuillez saisir votre mot de passe actuel')
      return
    }
    setPasswordSaving(true)
    try {
      const res = await fetch('/api/professor/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
        setPasswordSuccess('Mot de passe modifié avec succès.')
      } else {
        setPasswordError(data.error || 'Erreur lors du changement de mot de passe')
      }
    } catch {
      setPasswordError('Erreur réseau. Réessayez.')
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  const departments = ['informatique', 'gestion', 'finance', 'marketing', 'rh', 'comptabilite']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Profil</span>
        </h1>
        <p className="text-gray-600 text-lg">Gérez vos informations personnelles</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations personnelles</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 transition-colors"
                  placeholder="Votre nom complet"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 transition-colors"
                  placeholder="Votre numéro de téléphone"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Département
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200 transition-colors"
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
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Bureau
                </label>
                <input
                  type="text"
                  value={formData.office}
                  onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 transition-colors"
                  placeholder="Numéro ou localisation du bureau"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Heures de bureau
                </label>
                <input
                  type="text"
                  value={formData.office_hours}
                  onChange={(e) => setFormData({ ...formData, office_hours: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 transition-colors"
                  placeholder="Ex: Lundi-Vendredi 14h-16h"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Biographie
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 transition-colors resize-none"
                  placeholder="Votre biographie professionnelle..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Domaines d'expertise
                </label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 transition-colors"
                  placeholder="Séparés par des virgules (ex: IA, Machine Learning, Web Development)"
                />
                <p className="text-xs text-gray-500 mt-1">Séparez les domaines par des virgules</p>
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

        <form onSubmit={handlePasswordSubmit} className="mt-8">
          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier le mot de passe</h2>
            {passwordSuccess && (
              <p className="mb-4 text-sm text-emerald-600">{passwordSuccess}</p>
            )}
            {passwordError && (
              <p className="mb-4 text-sm text-red-600">{passwordError}</p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Mot de passe actuel</label>
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200"
                  placeholder="Mot de passe actuel"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200"
                  placeholder="Au moins 6 caractères"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200"
                  placeholder="Confirmer"
                />
              </div>
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-semibold disabled:opacity-50"
              >
                {passwordSaving ? 'Modification...' : 'Modifier le mot de passe'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
