'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120]

type EligibleProject = {
  id: string
  status: string
  student: { id: string; full_name: string | null; email: string | null; department: string | null } | null
  topic: { title: string | null } | null
  supervisor: { id: string; full_name: string | null; email: string | null; department: string | null } | null
}

type ProfessorOpt = { id: string; full_name: string | null; email: string | null; department: string | null }

function normalizePfeProject(d: any) {
  if (d.pfe_project) return d.pfe_project
  const p = d.pfe_projects
  const pp = Array.isArray(p) ? p[0] : p
  if (!pp) return null
  const student = pp.student && (Array.isArray(pp.student) ? pp.student[0] : pp.student)
  const topic = pp.topic && (Array.isArray(pp.topic) ? pp.topic[0] : pp.topic)
  const supervisor = pp.supervisor && (Array.isArray(pp.supervisor) ? pp.supervisor[0] : pp.supervisor)
  return { ...pp, student, topic, supervisor }
}

export default function DefensesPage() {
  const [defenses, setDefenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [periodStart, setPeriodStart] = useState<string | null>(null)
  const [periodEnd, setPeriodEnd] = useState<string | null>(null)
  const [eligibleProjects, setEligibleProjects] = useState<EligibleProject[]>([])
  const [professors, setProfessors] = useState<ProfessorOpt[]>([])

  const [pfeProjectId, setPfeProjectId] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [juror2Id, setJuror2Id] = useState('')
  const [juror3Id, setJuror3Id] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [room, setRoom] = useState('')
  const [notes, setNotes] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadDefenses = useCallback(async () => {
    const defRes = await fetch('/api/admin/defenses', { cache: 'no-store' })
    if (defRes.ok) setDefenses((await defRes.json()).defenses || [])
  }, [])

  const loadScheduleOptions = useCallback(async () => {
    setOptionsLoading(true)
    try {
      const res = await fetch('/api/admin/defenses/schedule-options', { cache: 'no-store' })
      if (!res.ok) return
      const j = await res.json()
      setPeriodStart(j.defensePeriodStart || null)
      setPeriodEnd(j.defensePeriodEnd || null)
      setEligibleProjects(j.eligibleProjects || [])
      setProfessors(j.professors || [])
    } finally {
      setOptionsLoading(false)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        await loadDefenses()
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [loadDefenses])

  useEffect(() => {
    if (showForm) void loadScheduleOptions()
  }, [showForm, loadScheduleOptions])

  const scheduledIds = useMemo(
    () => new Set(defenses.filter((d) => d.status !== 'cancelled').map((d) => d.pfe_project_id)),
    [defenses]
  )

  const selectedProject = useMemo(
    () => eligibleProjects.find((p) => p.id === pfeProjectId) || null,
    [eligibleProjects, pfeProjectId]
  )

  const supervisorId = selectedProject?.supervisor?.id || ''

  const otherProfessors = useMemo(() => {
    if (!supervisorId) return professors
    return professors.filter((p) => p.id !== supervisorId)
  }, [professors, supervisorId])

  useEffect(() => {
    if (juror2Id && juror2Id === juror3Id) setJuror3Id('')
  }, [juror2Id, juror3Id])

  const resetForm = () => {
    setPfeProjectId('')
    setDurationMinutes(30)
    setJuror2Id('')
    setJuror3Id('')
    setScheduledDate('')
    setScheduledTime('')
    setRoom('')
    setNotes('')
    setSubmitError('')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    if (!pfeProjectId || !scheduledDate) {
      setSubmitError('Choisissez un étudiant / projet et une date.')
      return
    }
    if (!supervisorId) {
      setSubmitError('Projet sans encadrant.')
      return
    }
    if (!juror2Id || !juror3Id || juror2Id === juror3Id) {
      setSubmitError('Choisissez deux enseignants distincts (autres que l’encadrant) pour compléter le jury.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/defenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pfe_project_id: pfeProjectId,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime || null,
          room: room.trim() || null,
          notes: notes.trim() || null,
          duration_minutes: durationMinutes,
          jury_professor_ids: [supervisorId, juror2Id, juror3Id],
        }),
      })
      const j = await res.json()
      if (!res.ok) {
        setSubmitError(j.error || 'Erreur')
        return
      }
      await loadDefenses()
      setShowForm(false)
      resetForm()
    } catch (err) {
      console.error(err)
      setSubmitError('Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/defenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) setDefenses(defenses.map((d) => (d.id === id ? { ...d, status } : d)))
    } catch (e) {
      console.error(e)
    }
  }

  const periodConfigured = !!(periodStart || periodEnd)
  const canOpenForm = eligibleProjects.some((p) => !scheduledIds.has(p.id))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Soutenances</span>
          </h1>
          <p className="text-gray-600 text-lg">Planifier les soutenances selon la période officielle et le jury (3 enseignants).</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm)
            if (showForm) resetForm()
          }}
          disabled={!canOpenForm}
          title={!canOpenForm ? 'Aucun étudiant éligible (validation encadrant + pas de soutenance active)' : undefined}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showForm ? 'Annuler' : 'Planifier une soutenance'}
        </button>
      </div>

      <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 px-4 py-3 text-sm text-cyan-950">
        <p className="font-semibold mb-1">Paramètres globaux</p>
        <p>
          Définissez la <strong>période des soutenances</strong> (date début / fin) dans{' '}
          <Link href="/dashboard/admin/annonces" className="underline font-medium text-cyan-900">
            Annonces &amp; paramètres
          </Link>
          . Les dates planifiées doivent tomber dans cet intervalle. L’<strong>encadrant</strong> doit marquer l’étudiant comme
          prêt dans <strong>Mes étudiants</strong> (espace enseignant) avant qu’il apparaisse ici.
        </p>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Nouvelle soutenance</h3>

          {optionsLoading ? (
            <p className="text-gray-600 text-sm">Chargement des options…</p>
          ) : (
            <>
              {!periodConfigured && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm px-4 py-3">
                  Aucune période de soutenance configurée : vous pouvez tout de même enregistrer une date, ou configurez les
                  dates dans Annonces &amp; paramètres pour activer le contrôle automatique.
                </div>
              )}
              {periodConfigured && (
                <p className="text-sm text-gray-600">
                  Période autorisée : <strong>{periodStart || '…'}</strong> → <strong>{periodEnd || '…'}</strong>
                </p>
              )}

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3">{submitError}</div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">Étudiant / projet PFE</label>
                  <p className="text-xs text-gray-500">
                    Uniquement les projets <strong>validés par l’encadrant pour la soutenance</strong>, sans soutenance déjà
                    planifiée (non annulée).
                  </p>
                  <select
                    required
                    value={pfeProjectId}
                    onChange={(e) => {
                      setPfeProjectId(e.target.value)
                      setJuror2Id('')
                      setJuror3Id('')
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">— Sélectionner —</option>
                    {eligibleProjects
                      .filter((p) => !scheduledIds.has(p.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {(p.student?.full_name || 'Étudiant') + ' — ' + (p.topic?.title || 'Sans sujet')}
                        </option>
                      ))}
                  </select>
                  {selectedProject?.supervisor && (
                    <p className="text-xs text-emerald-800 font-medium">
                      Encadrant (président de jury) : {selectedProject.supervisor.full_name || selectedProject.supervisor.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">Durée de la soutenance</label>
                  <p className="text-xs text-gray-500">Temps prévu pour la séance (présentation + questions).</p>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {DURATION_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m} minutes
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900">Jury — 2e et 3e membre</label>
                  <p className="text-xs text-gray-500">
                    Le jury comporte <strong>3 enseignants</strong> : l’encadrant de l’étudiant (automatique) et{' '}
                    <strong>deux autres professeurs</strong>, tous distincts.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">2e membre</label>
                      <select
                        required
                        value={juror2Id}
                        onChange={(e) => setJuror2Id(e.target.value)}
                        disabled={!supervisorId}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                      >
                        <option value="">— Choisir un enseignant —</option>
                        {otherProfessors.map((pr) => (
                          <option key={pr.id} value={pr.id} disabled={pr.id === juror3Id}>
                            {(pr.full_name || pr.id) + (pr.department ? ` · ${pr.department}` : '')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">3e membre</label>
                      <select
                        required
                        value={juror3Id}
                        onChange={(e) => setJuror3Id(e.target.value)}
                        disabled={!supervisorId}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                      >
                        <option value="">— Choisir un enseignant —</option>
                        {otherProfessors.map((pr) => (
                          <option key={pr.id} value={pr.id} disabled={pr.id === juror2Id}>
                            {(pr.full_name || pr.id) + (pr.department ? ` · ${pr.department}` : '')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">Date</label>
                  <p className="text-xs text-gray-500">Doit être dans la période configurée (si celle-ci est renseignée).</p>
                  <input
                    required
                    type="date"
                    min={periodStart || undefined}
                    max={periodEnd || undefined}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">Heure de début</label>
                  <p className="text-xs text-gray-500">Heure à laquelle commence la soutenance.</p>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900">Salle ou lien</label>
                  <p className="text-xs text-gray-500">Lieu physique ou indication de visioconférence.</p>
                  <input
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ex. : Amphi A, Salle 102, lien Zoom…"
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900">Notes internes</label>
                  <p className="text-xs text-gray-500">Optionnel — visible côté administration.</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Notes optionnelles"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting || optionsLoading}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? 'Enregistrement…' : 'Planifier'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {defenses
          .sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || ''))
          .map((d) => {
            const pp = normalizePfeProject(d)
            const student = pp?.student || {}
            const topic = pp?.topic || {}
            const statusColors: Record<string, string> = {
              scheduled: 'border-emerald-200',
              completed: 'border-gray-200',
              cancelled: 'border-red-200',
              postponed: 'border-orange-500/50',
            }
            const dur = d.duration_minutes != null ? `${d.duration_minutes} min` : null
            return (
              <div key={d.id} className={`bg-white rounded-2xl border shadow-sm ${statusColors[d.status] || 'border-gray-200'} p-6`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-gray-900 font-semibold">{student.full_name || student.name || 'N/A'}</p>
                    <p className="text-gray-600 text-sm">{topic.title || 'Sans sujet'}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {d.scheduled_date}
                      {d.scheduled_time && ` à ${String(d.scheduled_time).slice(0, 5)}`}
                      {dur && ` · ${dur}`}
                      {d.room && ` — ${d.room}`}
                    </p>
                    {d.jury_members?.length > 0 && (
                      <p className="text-gray-500 text-xs mt-1">Jury : {d.jury_members.join(', ')}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        d.status === 'scheduled'
                          ? 'bg-emerald-50 text-emerald-700'
                          : d.status === 'completed'
                            ? 'bg-blue-50 text-blue-700'
                            : d.status === 'cancelled'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-orange-50 text-orange-700'
                      }`}
                    >
                      {d.status === 'scheduled'
                        ? 'Planifiée'
                        : d.status === 'completed'
                          ? 'Terminée'
                          : d.status === 'cancelled'
                            ? 'Annulée'
                            : 'Reportée'}
                    </span>
                    {d.status === 'scheduled' && (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleStatusChange(d.id, 'completed')}
                          className="px-3 py-1 bg-emerald-600 text-white rounded text-sm"
                        >
                          Terminer
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleStatusChange(d.id, 'postponed')}
                          className="px-3 py-1 bg-orange-600 text-white rounded text-sm"
                        >
                          Reporter
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleStatusChange(d.id, 'cancelled')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                        >
                          Annuler
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {defenses.length === 0 && (
        <div className="bg-white rounded-2xl border shadow-sm border-gray-200 p-12 text-center">
          <p className="text-gray-600">Aucune soutenance planifiée</p>
        </div>
      )}
    </div>
  )
}
