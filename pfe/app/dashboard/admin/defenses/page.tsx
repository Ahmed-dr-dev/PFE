'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120]

type EligibleProject = {
  id: string
  status: string
  student: {
    id: string
    full_name: string | null
    email: string | null
    department: string | null
    year: string | null
  } | null
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
  const [studentDepartmentFilter, setStudentDepartmentFilter] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [juror2Id, setJuror2Id] = useState('')
  const [juror3Id, setJuror3Id] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [room, setRoom] = useState('')
  const [notes, setNotes] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [optionsError, setOptionsError] = useState('')
  const [defensePeriodComplete, setDefensePeriodComplete] = useState(false)
  const [validatedWaitingForPeriodCount, setValidatedWaitingForPeriodCount] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [fichePdfLoading, setFichePdfLoading] = useState<string | null>(null)

  const [editId, setEditId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editRoom, setEditRoom] = useState('')
  const [editDuration, setEditDuration] = useState(30)
  const [editNotes, setEditNotes] = useState('')
  const [editJuror2Id, setEditJuror2Id] = useState('')
  const [editJuror3Id, setEditJuror3Id] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const loadDefenses = useCallback(async () => {
    const defRes = await fetch('/api/admin/defenses', { cache: 'no-store' })
    if (defRes.ok) setDefenses((await defRes.json()).defenses || [])
  }, [])

  const loadScheduleOptions = useCallback(async () => {
    setOptionsLoading(true)
    setOptionsError('')
    try {
      const res = await fetch('/api/admin/defenses/schedule-options', { cache: 'no-store' })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setOptionsError(j.error || `Erreur ${res.status}`)
        setEligibleProjects([])
        setProfessors([])
        setDefensePeriodComplete(false)
        setValidatedWaitingForPeriodCount(0)
        return
      }
      setPeriodStart(j.defensePeriodStart || null)
      setPeriodEnd(j.defensePeriodEnd || null)
      setDefensePeriodComplete(!!j.defensePeriodComplete)
      setValidatedWaitingForPeriodCount(typeof j.validatedWaitingForPeriodCount === 'number' ? j.validatedWaitingForPeriodCount : 0)
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
    void loadScheduleOptions()
  }, [loadScheduleOptions])

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

  const studyDepartmentOptions = useMemo(() => {
    const set = new Set<string>()
    eligibleProjects
      .filter((p) => !scheduledIds.has(p.id))
      .forEach((p) => {
        const d = (p.student?.department || '').trim()
        if (d) set.add(d)
      })
    return [...set].sort((a, b) => a.localeCompare(b, 'fr'))
  }, [eligibleProjects, scheduledIds])

  const filteredProjectsForPicker = useMemo(() => {
    let list = eligibleProjects.filter((p) => !scheduledIds.has(p.id))
    if (studentDepartmentFilter === '') return list
    if (studentDepartmentFilter === '__none__') {
      return list.filter((p) => !(p.student?.department || '').trim())
    }
    return list.filter((p) => (p.student?.department || '').trim() === studentDepartmentFilter)
  }, [eligibleProjects, scheduledIds, studentDepartmentFilter])

  useEffect(() => {
    if (!pfeProjectId) return
    const ok = filteredProjectsForPicker.some((p) => p.id === pfeProjectId)
    if (!ok) {
      setPfeProjectId('')
      setJuror2Id('')
      setJuror3Id('')
    }
  }, [filteredProjectsForPicker, pfeProjectId])

  const deptLabel = (d: string) => d.charAt(0).toUpperCase() + d.slice(1)

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
    setStudentDepartmentFilter('')
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

  const openEdit = (d: any) => {
    setEditId(d.id)
    setEditDate(d.scheduled_date || '')
    setEditTime(d.scheduled_time ? String(d.scheduled_time).slice(0, 5) : '')
    setEditRoom(d.room || '')
    setEditDuration(d.duration_minutes || 30)
    setEditNotes(d.notes || '')
    const ids: string[] = d.jury_professor_ids || []
    setEditJuror2Id(ids[1] || '')
    setEditJuror3Id(ids[2] || '')
    setEditError('')
  }

  const handleEdit = async (d: any) => {
    if (!editDate) { setEditError('La date est requise.'); return }
    if (!editJuror2Id || !editJuror3Id || editJuror2Id === editJuror3Id) {
      setEditError('Choisissez deux membres distincts pour le jury.')
      return
    }
    setEditSaving(true)
    setEditError('')
    const pp = normalizePfeProject(d)
    const supervisorId = pp?.supervisor?.id || (d.jury_professor_ids?.[0] ?? '')
    const newJuryIds = [supervisorId, editJuror2Id, editJuror3Id]
    try {
      const res = await fetch(`/api/admin/defenses/${d.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_date: editDate,
          scheduled_time: editTime || null,
          room: editRoom.trim() || null,
          duration_minutes: editDuration,
          notes: editNotes.trim() || null,
          jury_professor_ids: newJuryIds,
        }),
      })
      const j = await res.json()
      if (!res.ok) { setEditError(j.error || 'Erreur'); return }
      await loadDefenses()
      setEditId(null)
    } catch {
      setEditError('Erreur réseau')
    } finally {
      setEditSaving(false)
    }
  }

  const handleExportPlanningPdf = useCallback(async () => {
    setPdfLoading(true)
    try {
      const { downloadDefensesPlanningPdf } = await import('@/lib/defenses-planning-pdf')
      downloadDefensesPlanningPdf(defenses)
    } catch (e) {
      console.error(e)
      window.alert('Impossible de générer le PDF. Réessayez ou vérifiez la console.')
    } finally {
      setPdfLoading(false)
    }
  }, [defenses])

  const handleFichePdf = useCallback(async (d: any) => {
    setFichePdfLoading(d.id)
    try {
      const { downloadDefenseFichePdf } = await import('@/lib/defenses-planning-pdf')
      downloadDefenseFichePdf(d)
    } catch (e) {
      console.error(e)
      window.alert('Impossible de générer la fiche PDF.')
    } finally {
      setFichePdfLoading(null)
    }
  }, [])

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

  const canOpenForm = defensePeriodComplete && eligibleProjects.some((p) => !scheduledIds.has(p.id))
  const planifierTitle = !defensePeriodComplete
    ? 'Définissez d’abord la période des soutenances (Annonces & paramètres)'
    : !eligibleProjects.some((p) => !scheduledIds.has(p.id))
      ? 'Aucun étudiant : les encadrants doivent valider leurs étudiants, ou tous ont déjà une soutenance'
      : undefined

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
          <p className="text-gray-600 text-lg">
            Flux : période (Annonces) → validation encadrant → planification ici (jury à 3, date dans la période).
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void handleExportPlanningPdf()}
            disabled={pdfLoading}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            {pdfLoading ? 'PDF…' : 'Télécharger le planning (PDF)'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm)
              if (showForm) resetForm()
            }}
            disabled={!canOpenForm}
            title={planifierTitle}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showForm ? 'Annuler' : 'Planifier une soutenance'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          className={`rounded-2xl border p-4 text-sm ${
            defensePeriodComplete ? 'border-emerald-200 bg-emerald-50/80 text-emerald-950' : 'border-amber-200 bg-amber-50/80 text-amber-950'
          }`}
        >
          <p className="font-bold mb-1">1. Période (admin)</p>
          <p>
            {defensePeriodComplete
              ? `Enregistrée : ${periodStart} → ${periodEnd}`
              : 'Renseignez les deux dates dans Annonces & paramètres et enregistrez.'}
          </p>
          {!defensePeriodComplete && (
            <Link href="/dashboard/admin/annonces" className="inline-block mt-2 font-semibold underline">
              Ouvrir Annonces
            </Link>
          )}
        </div>
        <div
          className={`rounded-2xl border p-4 text-sm ${
            eligibleProjects.length > 0 ? 'border-emerald-200 bg-emerald-50/80 text-emerald-950' : 'border-gray-200 bg-gray-50 text-gray-800'
          }`}
        >
          <p className="font-bold mb-1">2. Validation (encadrant)</p>
          <p>
            {defensePeriodComplete
              ? eligibleProjects.length > 0
                ? `${eligibleProjects.length} étudiant(s) prêt(s) à planifier`
                : 'Aucun étudiant n’a encore été validé par son encadrant.'
              : 'Les encadrants ne peuvent valider qu’après l’étape 1.'}
          </p>
        </div>
        <div
          className={`rounded-2xl border p-4 text-sm ${
            canOpenForm ? 'border-cyan-200 bg-cyan-50/80 text-cyan-950' : 'border-gray-200 bg-gray-50 text-gray-700'
          }`}
        >
          <p className="font-bold mb-1">3. Planifier</p>
          <p>Bouton « Planifier une soutenance » : jury 3 enseignants + date dans la période.</p>
        </div>
      </div>

      {!defensePeriodComplete && validatedWaitingForPeriodCount > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 text-amber-950 text-sm px-4 py-3">
          {validatedWaitingForPeriodCount} étudiant(s) déjà marqué(s) prêt(s) par un encadrant : ils apparaîtront ici dès que la
          période (étape 1) sera enregistrée correctement (deux dates valides, début ≤ fin).
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Nouvelle soutenance</h3>

          {optionsError && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3">{optionsError}</div>
          )}

          {optionsLoading ? (
            <p className="text-gray-600 text-sm">Chargement des options…</p>
          ) : (
            <>
              {!defensePeriodComplete && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm px-4 py-3">
                  La planification est bloquée tant que la période officielle (deux dates, début ≤ fin) n’est pas enregistrée dans{' '}
                  <Link href="/dashboard/admin/annonces" className="font-semibold underline">
                    Annonces &amp; paramètres
                  </Link>
                  .
                </div>
              )}
              {defensePeriodComplete && (
                <p className="text-sm text-gray-600">
                  Période autorisée pour la date de soutenance : <strong>{periodStart}</strong> → <strong>{periodEnd}</strong>
                </p>
              )}

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3">{submitError}</div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2 lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900">Filtrer par filière (département de l’étudiant)</label>
                  <p className="text-xs text-gray-500">
                    Affinez la liste ci-dessous selon le domaine / département enregistré sur le profil étudiant.
                  </p>
                  <select
                    value={studentDepartmentFilter}
                    onChange={(e) => setStudentDepartmentFilter(e.target.value)}
                    className="w-full max-w-md px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Toutes les filières</option>
                    {studyDepartmentOptions.map((d) => (
                      <option key={d} value={d}>
                        {deptLabel(d)}
                      </option>
                    ))}
                    {eligibleProjects.some(
                      (p) => !scheduledIds.has(p.id) && !(p.student?.department || '').trim()
                    ) ? (
                      <option value="__none__">Non renseigné</option>
                    ) : null}
                  </select>
                </div>

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
                    {filteredProjectsForPicker.map((p) => {
                      const dept = (p.student?.department || '').trim()
                      const yr = (p.student?.year || '').trim()
                      const filiere = [dept ? deptLabel(dept) : null, yr || null].filter(Boolean).join(' · ')
                      const suffix = filiere ? ` (${filiere})` : ''
                      return (
                        <option key={p.id} value={p.id}>
                          {(p.student?.full_name || 'Étudiant') + suffix + ' — ' + (p.topic?.title || 'Sans sujet')}
                        </option>
                      )
                    })}
                  </select>
                  {filteredProjectsForPicker.length === 0 && eligibleProjects.some((p) => !scheduledIds.has(p.id)) && (
                    <p className="text-xs text-amber-700">Aucun étudiant pour ce filtre — choisissez une autre filière.</p>
                  )}
                  {selectedProject?.supervisor && (
                    <p className="text-xs text-emerald-800 font-medium">
                      Encadrant (président de jury) : {selectedProject.supervisor.full_name || selectedProject.supervisor.email}
                    </p>
                  )}
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
                  <label className="block text-sm font-semibold text-gray-900">Jury — Rapporteur &amp; Président</label>
                  <p className="text-xs text-gray-500">
                    Le jury comporte <strong>3 enseignants</strong> : l’encadrant (automatique),{' '}
                    le <strong>rapporteur</strong> et le <strong>président du jury</strong>, tous distincts.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block shrink-0" />Rapporteur</label>
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
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" />Président du jury</label>
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
                  <p className="text-xs text-gray-500">Uniquement entre le début et la fin de la période officielle.</p>
                  <input
                    required
                    type="date"
                    min={defensePeriodComplete && periodStart ? periodStart : undefined}
                    max={defensePeriodComplete && periodEnd ? periodEnd : undefined}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
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
                      <div className="text-gray-500 text-xs mt-1 space-y-0.5">
                        {d.jury_members[0] && (
                          <p><span className="font-medium text-gray-600">Encadrant :</span> {d.jury_members[0]}</p>
                        )}
                        {d.jury_members[1] && (
                          <p><span className="font-medium text-violet-700">Rapporteur :</span> {d.jury_members[1]}</p>
                        )}
                        {d.jury_members[2] && (
                          <p><span className="font-medium text-amber-700">Président du jury :</span> {d.jury_members[2]}</p>
                        )}
                      </div>
                    )}
                    {/* Note attribuée par le président du jury */}
                    {d.note != null ? (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <span className="text-xs font-semibold text-emerald-700">Note :</span>
                        <span className="text-lg font-bold text-emerald-700 tabular-nums">{d.note}<span className="text-xs font-normal"> / 20</span></span>
                        {d.note_comment && (
                          <span className="text-xs text-emerald-600 italic border-l border-emerald-200 pl-2 max-w-xs truncate">{d.note_comment}</span>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-gray-400 italic">Note non attribuée</p>
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
                    <button
                      type="button"
                      onClick={() => editId === d.id ? setEditId(null) : openEdit(d)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded text-sm hover:bg-gray-200"
                    >
                      {editId === d.id ? 'Fermer' : 'Modifier'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleFichePdf(d)}
                      disabled={fichePdfLoading === d.id}
                      className="px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {fichePdfLoading === d.id ? 'PDF…' : 'Fiche PDF'}
                    </button>
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

                {editId === d.id && (() => {
                  const pp2 = normalizePfeProject(d)
                  const supId = pp2?.supervisor?.id || d.jury_professor_ids?.[0] || ''
                  const editableProfessors = professors.filter((p) => p.id !== supId)
                  return (
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-700 mb-4">Modifier la soutenance</p>
                      {editError && (
                        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-2">{editError}</div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                          <input
                            type="date"
                            value={editDate}
                            min={defensePeriodComplete && periodStart ? periodStart : undefined}
                            max={defensePeriodComplete && periodEnd ? periodEnd : undefined}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Heure de début</label>
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Durée (min)</label>
                          <select
                            value={editDuration}
                            onChange={(e) => setEditDuration(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            {DURATION_OPTIONS.map((m) => (
                              <option key={m} value={m}>{m} min</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Salle ou lien</label>
                          <input
                            value={editRoom}
                            onChange={(e) => setEditRoom(e.target.value)}
                            placeholder="Salle 102, Zoom…"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" /> Rapporteur</span>
                          </label>
                          <select
                            value={editJuror2Id}
                            onChange={(e) => { setEditJuror2Id(e.target.value); if (e.target.value === editJuror3Id) setEditJuror3Id('') }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="">— Choisir —</option>
                            {editableProfessors.map((pr) => (
                              <option key={pr.id} value={pr.id} disabled={pr.id === editJuror3Id}>
                                {(pr.full_name || pr.id) + (pr.department ? ` · ${pr.department}` : '')}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Président du jury</span>
                          </label>
                          <select
                            value={editJuror3Id}
                            onChange={(e) => setEditJuror3Id(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="">— Choisir —</option>
                            {editableProfessors.map((pr) => (
                              <option key={pr.id} value={pr.id} disabled={pr.id === editJuror2Id}>
                                {(pr.full_name || pr.id) + (pr.department ? ` · ${pr.department}` : '')}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-4">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Notes internes</label>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Notes optionnelles"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          disabled={editSaving}
                          onClick={() => void handleEdit(d)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {editSaving ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )
                })()}
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
