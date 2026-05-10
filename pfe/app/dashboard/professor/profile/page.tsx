'use client'

import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    department: '',
    office: '',
    office_hours: '',
    bio: '',
    expertise: '',
  })
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoverySaving, setRecoverySaving] = useState(false)
  const [recoveryMsg, setRecoveryMsg] = useState('')
  const [personalSaving, setPersonalSaving] = useState(false)
  const [personalMsg, setPersonalMsg] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/professor/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile(data.profile)
          setRecoveryEmail(data.profile?.recovery_email || '')
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

  async function saveRecoveryEmail(e: React.FormEvent) {
    e.preventDefault()
    setRecoveryMsg('')
    setRecoverySaving(true)
    try {
      const res = await fetch('/api/professor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recovery_email: recoveryEmail.trim() || null }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setRecoveryMsg(data.error || 'Erreur')
        return
      }
      setProfile(data.profile)
      setRecoveryEmail(data.profile?.recovery_email || '')
      setRecoveryMsg('E-mail de récupération enregistré.')
    } catch {
      setRecoveryMsg('Erreur réseau')
    } finally {
      setRecoverySaving(false)
    }
  }

  async function savePersonalPhone(e: React.FormEvent) {
    e.preventDefault()
    setPersonalMsg('')
    setPersonalSaving(true)
    try {
      const res = await fetch('/api/professor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone.trim() || null }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setPersonalMsg(data.error || 'Erreur')
        return
      }
      setProfile(data.profile)
      setFormData((prev) => ({ ...prev, phone: data.profile?.phone ?? '' }))
      setPersonalMsg('Téléphone enregistré.')
    } catch {
      setPersonalMsg('Erreur réseau')
    } finally {
      setPersonalSaving(false)
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
        <p className="text-gray-600 text-lg">
          Consultation de vos informations — vous pouvez mettre à jour le téléphone et l’e-mail de récupération
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <form onSubmit={saveRecoveryEmail} className="relative bg-white rounded-2xl border border-emerald-200 p-8 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-2">E-mail de récupération</h2>
          <p className="text-sm text-gray-600 mb-4">
            Utilisé pour le lien « mot de passe oublié ». Prioritaire sur l’identifiant de connexion s’il est renseigné. Laissez
            vide pour effacer.
          </p>
          {recoveryMsg && (
            <p className={`text-sm mb-3 ${recoveryMsg.includes('Erreur') ? 'text-red-600' : 'text-emerald-700'}`}>{recoveryMsg}</p>
          )}
          <label className="block text-sm font-semibold text-gray-600 mb-2">Adresse e-mail</label>
          <input
            type="email"
            value={recoveryEmail}
            onChange={(e) => setRecoveryEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-300 mb-4"
            placeholder="ex. prenom.nom@universite.ma"
            autoComplete="email"
          />
          <button
            type="submit"
            disabled={recoverySaving}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            {recoverySaving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>

        <form onSubmit={savePersonalPhone} className="space-y-6">
          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations personnelles</h2>

            {personalMsg && (
              <p className={`text-sm mb-4 ${personalMsg.includes('Erreur') ? 'text-red-600' : 'text-emerald-700'}`}>
                {personalMsg}
              </p>
            )}

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
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                  placeholder="Votre nom complet"
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
                <p className="text-xs text-gray-500 mt-1">Non modifiable ici — e-mail de récupération : encadré vert ci-dessus.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-300"
                  placeholder="Votre numéro de téléphone"
                  autoComplete="tel"
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
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
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
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
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
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
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
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed resize-none"
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
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                  placeholder="Séparés par des virgules (ex: IA, Machine Learning, Web Development)"
                />
                <p className="text-xs text-gray-500 mt-1">Séparez les domaines par des virgules</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={personalSaving}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50"
            >
              {personalSaving ? 'Enregistrement…' : 'Enregistrer le téléphone'}
            </button>
          </div>
        </form>

        <form onSubmit={(e) => e.preventDefault()} className="mt-8">
          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier le mot de passe</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Mot de passe actuel</label>
                <input
                  type="password"
                  value=""
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                  placeholder="Mot de passe actuel"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value=""
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                  placeholder="Au moins 6 caractères"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value=""
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                  placeholder="Confirmer"
                />
              </div>
              <button
                type="submit"
                disabled
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold opacity-50 cursor-not-allowed"
              >
                Modifier le mot de passe
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
