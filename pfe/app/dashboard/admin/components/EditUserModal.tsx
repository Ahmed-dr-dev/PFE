'use client'

import { useState, useEffect } from 'react'

type Role = 'student' | 'professor'

type User = {
  id: string
  full_name?: string
  name?: string
  email?: string
  phone?: string | null
  department?: string | null
  year?: string | null
  office?: string | null
  office_hours?: string | null
  bio?: string | null
  expertise?: string[] | null
}

const DEPARTMENTS = [
  { value: '', label: 'Sélectionnez' },
  { value: 'informatique', label: 'Informatique' },
  { value: 'gestion', label: 'Gestion' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'rh', label: 'Ressources Humaines' },
  { value: 'comptabilite', label: 'Comptabilité' },
]

const YEARS = [
  { value: '', label: 'Sélectionnez' },
  { value: '3ème année', label: '3ème année' },
  { value: '4ème année', label: '4ème année' },
  { value: '5ème année', label: '5ème année' },
]

type Props = {
  role: Role
  user: User | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditUserModal({ role, user, open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && user) setError('')
  }, [open, user])

  if (!open || !user) return null

  const fullName = user.full_name || user.name || ''
  const expertiseStr = Array.isArray(user.expertise) ? user.expertise.join(', ') : ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = e.currentTarget
    const fd = new FormData(form)
    const body: Record<string, unknown> = {
      fullName: (fd.get('fullName') as string) || fullName,
      email: (fd.get('email') as string) || user.email,
      department: (fd.get('department') as string) || null,
      phone: (fd.get('phone') as string) || null,
    }
    const newPassword = (fd.get('password') as string)?.trim()
    if (newPassword && newPassword.length >= 6) body.password = newPassword
    if (role === 'student') body.year = (fd.get('year') as string) || null
    if (role === 'professor') {
      body.office = (fd.get('office') as string) || null
      body.officeHours = (fd.get('officeHours') as string) || null
      body.bio = (fd.get('bio') as string) || null
      const exp = (fd.get('expertise') as string)?.trim()
      body.expertise = exp ? exp.split(',').map(s => s.trim()).filter(Boolean) : []
    }
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur')
        return
      }
      onSuccess()
      onClose()
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const title = role === 'student' ? 'Modifier l\'étudiant' : 'Modifier l\'enseignant'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1">Nom complet</label>
            <input name="fullName" type="text" defaultValue={fullName} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500/50" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1">CIN (identifiant)</label>
            <input name="email" type="text" defaultValue={user.email || ''} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500/50" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1">Téléphone</label>
            <input name="phone" type="tel" defaultValue={user.phone || ''} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
          </div>
          {role === 'student' && (
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1">Année</label>
              <select name="year" defaultValue={user.year || ''} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500/50">
                {YEARS.map(o => <option key={o.value || 'x'} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
          {role === 'professor' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Département</label>
                <select name="department" defaultValue={user.department || ''} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500/50">
                  {DEPARTMENTS.map(o => <option key={o.value || 'x'} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Bureau</label>
                <input name="office" type="text" defaultValue={user.office || ''} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Heures de bureau</label>
                <input name="officeHours" type="text" defaultValue={user.office_hours || ''} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Biographie</label>
                <textarea name="bio" rows={2} defaultValue={user.bio || ''} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Expertise (virgules)</label>
                <input name="expertise" type="text" defaultValue={expertiseStr} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
            </>
          )}
          {role === 'student' && (
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1">Département</label>
              <select name="department" defaultValue={user.department || ''} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500/50">
                {DEPARTMENTS.map(o => <option key={o.value || 'x'} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1">Nouveau mot de passe (optionnel)</label>
            <input name="password" type="text" minLength={6} placeholder="Laisser vide pour ne pas changer" className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
          </div>
          <button type="submit" disabled={loading} className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 font-semibold disabled:opacity-50">
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}
