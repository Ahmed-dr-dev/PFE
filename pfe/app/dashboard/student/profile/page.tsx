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
    recovery_email: '',
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
        const res = await fetch('/api/student/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile(data.profile)
          setFormData({
            full_name: data.profile?.full_name || '',
            phone: data.profile?.phone || '',
            department: data.profile?.department || '',
            year: data.profile?.year || '',
            recovery_email: data.profile?.recovery_email || '',
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
      const res = await fetch('/api/student/change-password', {
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
  const years = ['1', '2', '3', '4', '5']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Profil</span>
        </h1>
        <p className="text-gray-600 text-lg">Consultation de vos informations personnelles</p>
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mt-3 max-w-2xl">
          Les champs sont en lecture seule. Pour toute modification, contactez l&apos;administration.
        </p>
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
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 placeholder-gray-400 cursor-not-allowed"
                  placeholder="Votre nom complet"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Identifiant de connexion (CIN / e-mail)
                </label>
                <input
                  type="text"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Utilisé pour vous connecter — non modifiable ici.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  E-mail de récupération (mot de passe oublié)
                </label>
                <input
                  type="email"
                  value={formData.recovery_email}
                  onChange={(e) => setFormData({ ...formData, recovery_email: e.target.value })}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 placeholder-gray-400 cursor-not-allowed"
                  placeholder="ex. prenom.nom@gmail.com"
                  autoComplete="email"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Adresse où Brevo enverra le lien de réinitialisation. Obligatoire si votre identifiant de connexion n’est pas
                  une vraie adresse e-mail. Laissez vide pour effacer.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 placeholder-gray-400 cursor-not-allowed"
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
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
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
                  Année d'étude
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
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
              disabled
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-semibold opacity-50 cursor-not-allowed"
            >
              Enregistrement désactivé
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
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                  placeholder="Mot de passe actuel"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                  placeholder="Au moins 6 caractères"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                  placeholder="Confirmer"
                />
              </div>
              <button
                type="submit"
                disabled
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold opacity-50 cursor-not-allowed"
              >
                Modification du mot de passe désactivée
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
