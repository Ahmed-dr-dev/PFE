'use client'

import { useState, useRef } from 'react'

type Role = 'student' | 'professor'

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

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''))
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, j) => { row[h] = values[j] ?? '' })
    rows.push(row)
  }
  return rows
}

function csvRowToBody(row: Record<string, string>, role: Role): Record<string, unknown> | null {
  const email = (row.email ?? row.cin ?? row.identifiant ?? '').trim()
  const fullName = (row.fullname ?? row.nom ?? row.name ?? '').trim()
  const password = (row.password ?? row.motdepasse ?? row.datenaissance ?? '').trim()
  if (!email || !fullName || !password) return null
  const body: Record<string, unknown> = {
    email,
    password,
    fullName,
    role,
    department: (row.department ?? row.departement ?? '').trim() || null,
    phone: (row.phone ?? row.telephone ?? '').trim() || null,
  }
  if (role === 'student') {
    body.year = (row.year ?? row.annee ?? '').trim() || null
  }
  if (role === 'professor') {
    body.office = (row.office ?? row.bureau ?? '').trim() || null
    body.officeHours = (row.officehours ?? row.heures ?? '').trim() || null
    body.bio = (row.bio ?? row.biographie ?? '').trim() || null
    const exp = (row.expertise ?? row.domaines ?? '').trim()
    body.expertise = exp ? exp.split(',').map(s => s.trim()).filter(Boolean) : []
  }
  return body
}

type Props = {
  role: Role
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateUserModal({ role, open, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<'single' | 'csv'>('single')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [bulkResult, setBulkResult] = useState<{ created: number; failed: number; errors: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSingleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const form = e.currentTarget
    const fd = new FormData(form)
    const body: Record<string, unknown> = {
      email: fd.get('email') as string,
      password: fd.get('password') as string,
      fullName: fd.get('fullName') as string,
      role,
      department: (fd.get('department') as string) || null,
      phone: (fd.get('phone') as string) || null,
    }
    if (role === 'student') body.year = (fd.get('year') as string) || null
    if (role === 'professor') {
      body.office = (fd.get('office') as string) || null
      body.officeHours = (fd.get('officeHours') as string) || null
      body.bio = (fd.get('bio') as string) || null
      const exp = (fd.get('expertise') as string)?.trim()
      body.expertise = exp ? exp.split(',').map(s => s.trim()).filter(Boolean) : []
    }
    try {
      const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur')
        return
      }
      setSuccess(`Compte créé : ${data.user?.full_name}. CIN = ${data.user?.email}.`)
      form.reset()
      onSuccess()
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError('')
    setBulkResult(null)
    const text = await file.text()
    const rows = parseCSV(text)
    if (!rows.length) {
      setError('Fichier CSV vide ou format invalide. En-têtes attendus : email, fullName, password, (phone, year/department, etc.)')
      setLoading(false)
      return
    }
    let created = 0
    const errors: string[] = []
    for (let i = 0; i < rows.length; i++) {
      const body = csvRowToBody(rows[i], role)
      if (!body) {
        errors.push(`Ligne ${i + 2} : email, fullName ou password manquant`)
        continue
      }
      try {
        const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const data = await res.json()
        if (res.ok) {
          created++
        } else {
          errors.push(`Ligne ${i + 2} (${body.email}) : ${data.error || 'Erreur'}`)
        }
      } catch {
        errors.push(`Ligne ${i + 2} (${body.email}) : Erreur réseau`)
      }
    }
    setBulkResult({ created, failed: rows.length - created, errors })
    if (created > 0) onSuccess()
    setLoading(false)
    e.target.value = ''
  }

  if (!open) return null

  const title = role === 'student' ? 'Créer un compte étudiant' : 'Créer un compte enseignant'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-600 hover:text-gray-900 rounded-lg">✕</button>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setMode('single'); setError(''); setSuccess(''); setBulkResult(null) }}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${mode === 'single' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}`}
            >
              Un utilisateur
            </button>
            <button
              type="button"
              onClick={() => { setMode('csv'); setError(''); setSuccess(''); setBulkResult(null) }}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${mode === 'csv' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}`}
            >
              Importer CSV
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">{success}</div>}
          {bulkResult && (
            <div className="mb-4 p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm">
              <p className="text-gray-900">Créés : {bulkResult.created} — Échecs : {bulkResult.failed}</p>
              {bulkResult.errors.length > 0 && (
                <ul className="mt-2 text-red-700 text-xs max-h-32 overflow-y-auto">
                  {bulkResult.errors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
                  {bulkResult.errors.length > 10 && <li>… et {bulkResult.errors.length - 10} autres</li>}
                </ul>
              )}
            </div>
          )}

          {mode === 'single' && (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nom complet</label>
                <input name="fullName" type="text" required className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200" placeholder="Nom complet" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">CIN (identifiant)</label>
                <input name="email" type="text" required className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200" placeholder="Numéro CIN" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Téléphone</label>
                <input name="phone" type="tel" className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200" placeholder="+212 6XX XXX XXX" />
              </div>
              {role === 'student' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Année</label>
                  <select name="year" className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200">
                    {YEARS.map(o => <option key={o.value || 'x'} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              )}
              {role === 'professor' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Département</label>
                    <select name="department" className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200">
                      {DEPARTMENTS.map(o => <option key={o.value || 'x'} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Bureau</label>
                    <input name="office" type="text" className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200" placeholder="Ex: Bureau 205" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Heures de bureau</label>
                    <input name="officeHours" type="text" className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200" placeholder="Lundi-Vendredi 14h-16h" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Biographie</label>
                    <textarea name="bio" rows={2} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 resize-none" placeholder="Brève description" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Expertise (virgules)</label>
                    <input name="expertise" type="text" className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200" placeholder="IA, Web, BDD" />
                  </div>
                </>
              )}
              {role === 'student' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Département (optionnel)</label>
                  <select name="department" className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200">
                    {DEPARTMENTS.map(o => <option key={o.value || 'x'} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Date de naissance (mot de passe)</label>
                <input name="password" type="text" required minLength={6} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200" placeholder="JJ/MM/AAAA ou JJMMAAAA" />
              </div>
              <button type="submit" disabled={loading} className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 font-semibold disabled:opacity-50">
                {loading ? 'Création...' : 'Créer le compte'}
              </button>
            </form>
          )}

          {mode === 'csv' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                CSV avec en-têtes : <code className="text-emerald-400">email, fullName, password</code> (obligatoires), puis <code className="text-emerald-400">phone, year, department</code> (étudiants) ou <code className="text-emerald-400">department, office, officeHours, bio, expertise</code> (enseignants).
              </p>
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
              <button
                type="button"
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50 border border-gray-200"
              >
                {loading ? 'Import en cours...' : 'Choisir un fichier CSV'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
