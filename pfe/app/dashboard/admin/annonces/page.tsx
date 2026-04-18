'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

/** Étape 1 du flux soutenances : à remplir en premier (voir page Soutenances admin). */
const DEFENSE_PERIOD_SETTING_KEYS = [
  { key: 'defense_period_start', label: 'Date de début de la période', type: 'date' as const },
  { key: 'defense_period_end', label: 'Date de fin de la période', type: 'date' as const },
]

const SETTING_KEYS = [
  { key: 'academic_year', label: 'Année académique', placeholder: '2024-2025' },
  { key: 'topic_submission_deadline', label: 'Date limite soumission sujets', type: 'date' },
  { key: 'internship_request_deadline', label: 'Date limite demandes de stage', type: 'date' },
  { key: 'defense_registration_deadline', label: 'Date limite inscription soutenances', type: 'date' },
]

export default function AnnoncesPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)

  const [stats, setStats] = useState<{ totalStudents: number; totalProfessors: number } | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const [professors, setProfessors] = useState<any[]>([])
  const [professorsLoading, setProfessorsLoading] = useState(false)
  const [professorsLoaded, setProfessorsLoaded] = useState(false)
  const [capacityModalOpen, setCapacityModalOpen] = useState(false)
  const [capacitySavingId, setCapacitySavingId] = useState<string | null>(null)

  const [announcements, setAnnouncements] = useState<any[]>([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', target_audience: 'all' })

  const [planningModalOpen, setPlanningModalOpen] = useState(false)
  const [planningDefenses, setPlanningDefenses] = useState<any[]>([])
  const [planningLoading, setPlanningLoading] = useState(false)
  const [planningPublishing, setPlanningPublishing] = useState(false)
  const [planningTitle, setPlanningTitle] = useState('')

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data = await res.json()
          setStats({
            totalStudents: data.totalStudents || 0,
            totalProfessors: data.totalProfessors || 0,
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    if (!capacityModalOpen || professorsLoaded) return
    async function fetchProfessors() {
      setProfessorsLoading(true)
      try {
        const res = await fetch('/api/admin/professors')
        if (res.ok) {
          const data = await res.json()
          setProfessors(data.professors || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setProfessorsLoading(false)
        setProfessorsLoaded(true)
      }
    }
    fetchProfessors()
  }, [capacityModalOpen, professorsLoaded])

  useEffect(() => {
    if (!capacityModalOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCapacityModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [capacityModalOpen])

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data.settings || {})
        }
      } catch (e) {
        console.error(e)
      } finally {
        setSettingsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/announcements')
        if (res.ok) setAnnouncements((await res.json()).announcements || [])
      } catch (e) {
        console.error(e)
      } finally {
        setAnnouncementsLoading(false)
      }
    }
    load()
  }, [])

  const saveCapacity = async (professorId: string, nextCapacity: number) => {
    setCapacitySavingId(professorId)
    try {
      const res = await fetch(`/api/admin/professors/${professorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supervision_capacity: nextCapacity }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Erreur')
        return
      }
      setProfessors((prev) =>
        prev.map((p) =>
          p.id === professorId ? { ...p, supervisionCapacity: data.professor?.supervisionCapacity ?? nextCapacity } : p
        )
      )
    } catch (e) {
      alert('Erreur réseau')
    } finally {
      setCapacitySavingId(null)
    }
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) alert('Paramètres enregistrés')
      else alert((await res.json()).error || 'Erreur')
    } catch (e) {
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        setAnnouncements([data.announcement, ...announcements])
        setShowForm(false)
        setForm({ title: '', content: '', target_audience: 'all' })
      } else {
        alert((await res.json()).error)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
      if (res.ok) setAnnouncements(announcements.filter((a) => a.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const MOIS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
  function fmtDate(iso: string | null): string {
    if (!iso) return '—'
    const p = iso.slice(0, 10).split('-')
    if (p.length !== 3) return iso
    const [y, m, d] = p.map(Number)
    return `${d} ${MOIS_FR[(m ?? 1) - 1] ?? ''} ${y}`
  }
  function fmtTime(t: string | null): string {
    if (!t) return ''
    return ` à ${String(t).slice(0, 5)}`
  }

  function buildPlanningContent(defenses: any[]): string {
    const scheduled = defenses
      .filter((d) => d.status === 'scheduled' || d.status === 'completed')
      .sort((a, b) => {
        const dc = (a.scheduled_date || '').localeCompare(b.scheduled_date || '')
        if (dc !== 0) return dc
        return (a.scheduled_time || '').localeCompare(b.scheduled_time || '')
      })
    if (scheduled.length === 0) return 'Aucune soutenance planifiée.'

    const groups = new Map<string, any[]>()
    for (const d of scheduled) {
      const key = d.scheduled_date || 'Sans date'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(d)
    }

    const lines: string[] = []
    for (const [date, rows] of groups) {
      lines.push(`📅 ${fmtDate(date)}`)
      lines.push('─────────────────────────')
      for (const d of rows) {
        const p = Array.isArray(d.pfe_projects) ? d.pfe_projects[0] : d.pfe_projects
        const student = p?.student?.full_name || p?.student?.email || 'Étudiant'
        const topic = p?.topic?.title ? ` — ${p.topic.title}` : ''
        const time = fmtTime(d.scheduled_time)
        const room = d.room ? ` | Salle : ${d.room}` : ''
        const jury = d.jury_members?.length
          ? `\n   Jury : ${d.jury_members.join(' · ')}`
          : ''
        const note = d.note != null ? ` | Note : ${d.note}/20` : ''
        lines.push(`• ${student}${topic}\n   ⏰ ${String(d.scheduled_time || '').slice(0, 5) || '—'}${time ? '' : ''}${time}${room}${note}${jury}`)
      }
      lines.push('')
    }
    return lines.join('\n').trim()
  }

  const openPlanningModal = async () => {
    setPlanningLoading(true)
    setPlanningModalOpen(true)
    const defaultTitle = `Planning des soutenances${settings.academic_year ? ` — ${settings.academic_year}` : ''}`
    setPlanningTitle(defaultTitle)
    try {
      const res = await fetch('/api/admin/defenses', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setPlanningDefenses(data.defenses || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setPlanningLoading(false)
    }
  }

  const handlePublishPlanning = async () => {
    const content = buildPlanningContent(planningDefenses)
    setPlanningPublishing(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: planningTitle, content, target_audience: 'students' }),
      })
      if (res.ok) {
        const data = await res.json()
        setAnnouncements([data.announcement, ...announcements])
        setPlanningModalOpen(false)
        setPlanningDefenses([])
      } else {
        alert((await res.json()).error || 'Erreur')
      }
    } catch {
      alert('Erreur réseau')
    } finally {
      setPlanningPublishing(false)
    }
  }

  const targetLabels: Record<string, string> = { all: 'Tous', students: 'Étudiants', professors: 'Enseignants' }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Annonces</span>
        </h1>
        <p className="text-gray-600 text-lg">Paramètres de la plateforme et annonces</p>
      </div>

      {/* Statistiques */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Statistiques</h2>
        {statsLoading ? (
          <p className="text-gray-600">Chargement...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <p className="text-sm font-semibold text-gray-600">Total étudiants</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalStudents ?? 0}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <p className="text-sm font-semibold text-gray-600">Total enseignants</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalProfessors ?? 0}</p>
            </div>
          </div>
        )}
      </section>

      {/* Paramètres */}
      <section>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={capacityModalOpen}
            aria-label="Ouvrir la capacité d’encadrement"
            title="Capacité d’encadrement"
            onClick={() => setCapacityModalOpen(true)}
            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        {settingsLoading ? (
          <p className="text-gray-600">Chargement...</p>
        ) : (
          <form onSubmit={handleSettingsSubmit} className="max-w-2xl space-y-6">
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-cyan-50/80 shadow-sm p-8 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">1. Période des soutenances (à configurer en premier)</h3>
              <p className="text-sm text-gray-700">
                Les encadrants ne pourront marquer un étudiant « prêt pour la soutenance » qu’après enregistrement de ces deux dates.
                Ensuite, les étudiants validés apparaîtront sur la page{' '}
                <Link href="/dashboard/admin/defenses" className="font-semibold text-emerald-800 underline underline-offset-2">
                  Soutenances
                </Link>{' '}
                pour planifier une date dans cet intervalle.
              </p>
              {DEFENSE_PERIOD_SETTING_KEYS.map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">{label}</label>
                  <input
                    type={type}
                    value={settings[key] || ''}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Autres échéances</h3>
              {SETTING_KEYS.map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">{label}</label>
                  <input
                    type={type || 'text'}
                    value={settings[key] || ''}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={settingsSaving}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 font-semibold disabled:opacity-50"
              >
                {settingsSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
              </button>
            </div>
          </form>
        )}
      </section>

      {capacityModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="presentation"
          onClick={() => setCapacityModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="capacity-modal-title"
            className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-4xl max-h-[min(90vh,900px)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-200 shrink-0">
              <div>
                <h3 id="capacity-modal-title" className="text-xl font-bold text-gray-900">
                  Capacité d&apos;encadrement
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Nombre max. d&apos;étudiants par enseignant (défaut 8). Enregistrez chaque ligne avec le bouton sur la ligne.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCapacityModalOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {professorsLoading ? (
                <p className="text-gray-600 text-sm py-8 text-center">Chargement des enseignants...</p>
              ) : (
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Enseignant</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Encadrés</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Capacité</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">État</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {professors.map((p) => {
                          const capacity = Number(p.supervisionCapacity ?? 8)
                          const count = Number(p.studentsCount ?? 0)
                          const over = count > capacity
                          return (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="font-semibold text-gray-900">{p.name || p.email}</div>
                                <div className="text-xs text-gray-500">{p.email}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-semibold text-gray-900">{count}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={capacity}
                                    onChange={(e) =>
                                      setProfessors((prev) =>
                                        prev.map((x) =>
                                          x.id === p.id ? { ...x, supervisionCapacity: Number(e.target.value) } : x
                                        )
                                      )
                                    }
                                    className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  />
                                  <button
                                    type="button"
                                    disabled={capacitySavingId === p.id}
                                    onClick={() => saveCapacity(p.id, capacity)}
                                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 text-xs sm:text-sm"
                                  >
                                    {capacitySavingId === p.id ? '...' : 'Enregistrer'}
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                    over ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                                  }`}
                                >
                                  {over ? 'Dépassement' : 'OK'}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                        {professors.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-600">
                              Aucun enseignant
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() => setCapacityModalOpen(false)}
                className="px-4 py-2.5 rounded-lg font-semibold border border-gray-200 text-gray-800 hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Annonces */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Annonces</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void openPlanningModal()}
              className="px-4 py-2 bg-white border border-emerald-300 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Publier le planning des soutenances
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-cyan-700"
            >
              {showForm ? 'Annuler' : 'Nouvelle annonce'}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Nouvelle annonce</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Titre de l'annonce"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
              <textarea
                required
                rows={4}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Contenu de l'annonce"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destinataires</label>
              <select value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="all">Tous</option>
                <option value="students">Étudiants uniquement</option>
                <option value="professors">Enseignants uniquement</option>
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700">Publier</button>
          </form>
        )}

        {announcementsLoading ? (
          <p className="text-gray-600">Chargement...</p>
        ) : (
          <>
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-gray-900 font-semibold">{a.title}</p>
                      <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{a.content}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {targetLabels[a.target_audience] || a.target_audience} • {new Date(a.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(a.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 shrink-0">
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {announcements.length === 0 && !showForm && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                <p className="text-gray-600">Aucune annonce</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Planning modal */}
      {planningModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => { if (!planningPublishing) setPlanningModalOpen(false) }}
        >
          <div
            className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-200 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Publier le planning des soutenances</h3>
                <p className="text-sm text-gray-500 mt-1">L&apos;annonce sera envoyée à tous les étudiants.</p>
              </div>
              <button
                type="button"
                onClick={() => setPlanningModalOpen(false)}
                disabled={planningPublishing}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre de l&apos;annonce</label>
                <input
                  value={planningTitle}
                  onChange={(e) => setPlanningTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1.5">Aperçu du contenu</p>
                {planningLoading ? (
                  <p className="text-sm text-gray-500 text-center py-8">Chargement des soutenances…</p>
                ) : planningDefenses.filter((d) => d.status === 'scheduled' || d.status === 'completed').length === 0 ? (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-4 text-sm text-amber-800">
                    Aucune soutenance planifiée à publier.
                  </div>
                ) : (
                  <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-4 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed max-h-72 overflow-y-auto">
                    {buildPlanningContent(planningDefenses)}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {planningDefenses.filter((d) => d.status === 'scheduled' || d.status === 'completed').length} soutenance(s) incluse(s)
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 shrink-0 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPlanningModalOpen(false)}
                disabled={planningPublishing}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={planningPublishing || planningLoading || planningDefenses.filter((d) => d.status === 'scheduled' || d.status === 'completed').length === 0}
                onClick={() => void handlePublishPlanning()}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
              >
                {planningPublishing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Publication…
                  </>
                ) : 'Publier aux étudiants'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
