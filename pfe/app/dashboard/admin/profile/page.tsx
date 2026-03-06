'use client'

import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
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
        const res = await fetch('/api/admin/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile(data.profile)
          setFormData({
            full_name: data.profile?.full_name || '',
            phone: data.profile?.phone || '',
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
      const res = await fetch('/api/admin/profile', {
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
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.profile) setProfile(data.profile)
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

        <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6">
          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier le mot de passe</h2>
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm">
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {passwordError}
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Mot de passe actuel</label>
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, current_password: e.target.value })
                    setPasswordSuccess('')
                    setPasswordError('')
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, new_password: e.target.value })
                    setPasswordSuccess('')
                    setPasswordError('')
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 transition-colors"
                  placeholder="Au moins 6 caractères"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                    setPasswordSuccess('')
                    setPasswordError('')
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 transition-colors"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={passwordSaving}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordSaving ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
