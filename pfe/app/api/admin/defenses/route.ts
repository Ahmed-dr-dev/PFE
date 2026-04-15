import { defenseDateInPeriod, parseDefenseDateOnly, resolveDefensePeriod } from '@/lib/defense-period'
import { requireAuth } from '@/lib/auth'
import { getSupabaseForAdminData } from '@/lib/supabase/admin-server'
import { NextResponse } from 'next/server'


export async function GET() {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const supabase = await getSupabaseForAdminData()
    const { data, error } = await supabase
      .from('defenses')
      .select(`
        *,
        pfe_projects(
          id,
          status,
          student_id,
          topic_id,
          supervisor_id,
          student:profiles!pfe_projects_student_id_fkey(id, full_name, email, department),
          topic:pfe_topics(id, title),
          supervisor:profiles!pfe_projects_supervisor_id_fkey(id, full_name)
        )
      `)
      .order('scheduled_date', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const defenses = (data || []).map((d: { pfe_projects: unknown }) => {
      const p = d.pfe_projects
      const pp = Array.isArray(p) ? p[0] : p
      const student = pp?.student && (Array.isArray(pp.student) ? pp.student[0] : pp.student)
      const topic = pp?.topic && (Array.isArray(pp.topic) ? pp.topic[0] : pp.topic)
      const supervisor = pp?.supervisor && (Array.isArray(pp.supervisor) ? pp.supervisor[0] : pp.supervisor)
      return { ...d, pfe_project: pp ? { ...pp, student, topic, supervisor } : null }
    })
    return NextResponse.json({ defenses })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const { pfe_project_id, scheduled_date, scheduled_time, room, notes, duration_minutes: durationRaw, jury_professor_ids: juryIdsRaw } =
      body

    const dateOnly = typeof scheduled_date === 'string' ? parseDefenseDateOnly(scheduled_date) : null
    if (!pfe_project_id || !dateOnly) {
      return NextResponse.json({ error: 'Projet PFE et date valides (AAAA-MM-JJ) requis' }, { status: 400 })
    }

    const duration =
      typeof durationRaw === 'number' && Number.isFinite(durationRaw)
        ? Math.min(240, Math.max(15, Math.floor(durationRaw)))
        : 30

    const supabase = await getSupabaseForAdminData()

    const { data: periodRows } = await supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', ['defense_period_start', 'defense_period_end'])

    const periodMap = Object.fromEntries((periodRows || []).map((r) => [r.key, (r.value || '').trim()]))
    const period = resolveDefensePeriod(periodMap.defense_period_start, periodMap.defense_period_end)

    if (!period.complete) {
      return NextResponse.json(
        {
          error:
            'Définissez d’abord la période des soutenances (date de début et date de fin) dans Annonces & paramètres, puis enregistrez.',
        },
        { status: 400 }
      )
    }

    if (!defenseDateInPeriod(dateOnly, period)) {
      return NextResponse.json(
        {
          error: `La date de soutenance doit être entre ${period.start} et ${period.end} (période officielle).`,
        },
        { status: 400 }
      )
    }

    const { data: project, error: pErr } = await supabase
      .from('pfe_projects')
      .select('id, supervisor_id, status, app_validated, rapport_validated, soutenance_validated')
      .eq('id', pfe_project_id)
      .maybeSingle()

    if (pErr || !project) {
      return NextResponse.json({ error: 'Projet PFE introuvable' }, { status: 404 })
    }

    if (!project.supervisor_id) {
      return NextResponse.json({ error: 'Ce projet n’a pas d’encadrant assigné' }, { status: 400 })
    }

    const pst = String(project.status || '').toLowerCase()
    if (pst === 'rejected' || pst === 'completed') {
      return NextResponse.json(
        { error: 'Ce projet ne peut pas recevoir de soutenance (statut rejeté ou déjà terminé).' },
        { status: 400 }
      )
    }

    if (!project.app_validated) {
      return NextResponse.json(
        { error: 'L’application de l’étudiant doit être validée avant de planifier une soutenance.' },
        { status: 400 }
      )
    }

    if (!project.rapport_validated) {
      return NextResponse.json(
        { error: 'Le rapport de l’étudiant doit être validé avant de planifier une soutenance.' },
        { status: 400 }
      )
    }

    if (!project.soutenance_validated) {
      return NextResponse.json(
        {
          error:
            'L’encadrant doit valider l’étudiant pour la soutenance (suivi → Valider pour la soutenance).',
        },
        { status: 400 }
      )
    }

    const { data: existingDef } = await supabase
      .from('defenses')
      .select('id')
      .eq('pfe_project_id', pfe_project_id)
      .neq('status', 'cancelled')
      .maybeSingle()

    if (existingDef) {
      return NextResponse.json({ error: 'Une soutenance non annulée existe déjà pour ce projet' }, { status: 400 })
    }

    if (!Array.isArray(juryIdsRaw) || juryIdsRaw.length !== 3) {
      return NextResponse.json(
        { error: 'Le jury doit comporter exactement 3 enseignants : l’encadrant puis deux autres membres.' },
        { status: 400 }
      )
    }

    const juryProfessorIds = juryIdsRaw.map((x: unknown) => String(x))
    const supId = project.supervisor_id as string
    if (juryProfessorIds[0] !== supId) {
      return NextResponse.json(
        { error: 'Le premier membre du jury doit être l’encadrant de l’étudiant' },
        { status: 400 }
      )
    }
    const uniq = new Set(juryProfessorIds)
    if (uniq.size !== 3) {
      return NextResponse.json({ error: 'Les trois membres du jury doivent être distincts' }, { status: 400 })
    }
    const { data: jurors, error: jErr } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('id', juryProfessorIds)
    if (jErr || !jurors || jurors.length !== 3) {
      return NextResponse.json({ error: 'Membres du jury invalides' }, { status: 400 })
    }
    if (jurors.some((j) => j.role !== 'professor')) {
      return NextResponse.json({ error: 'Tous les membres du jury doivent être des enseignants' }, { status: 400 })
    }
    const orderMap = new Map(juryProfessorIds.map((id, i) => [id, i]))
    const juryNames = [...jurors]
      .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
      .map((j) => j.full_name || j.id)

    const insertPayload: Record<string, unknown> = {
      pfe_project_id,
      scheduled_date: dateOnly,
      scheduled_time: scheduled_time || null,
      room: typeof room === 'string' && room.trim() ? room.trim().slice(0, 200) : null,
      jury_members: juryNames.length > 0 ? juryNames : [],
      notes: typeof notes === 'string' && notes.trim() ? notes.trim().slice(0, 4000) : null,
      status: 'scheduled',
      duration_minutes: duration,
    }

    insertPayload.jury_professor_ids = juryProfessorIds

    const { data, error } = await supabase.from('defenses').insert(insertPayload).select().single()

    if (error) {
      if (error.message?.includes('duration_minutes') || error.message?.includes('jury_professor_ids')) {
        return NextResponse.json(
          {
            error:
              'Colonnes de soutenance manquantes. Exécutez la migration defenses-scheduling-supervisor-ready.sql.',
          },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: fullRow } = await supabase
      .from('defenses')
      .select(
        `
        *,
        pfe_projects(
          id,
          status,
          student_id,
          topic_id,
          supervisor_id,
          student:profiles!pfe_projects_student_id_fkey(id, full_name, email, department),
          topic:pfe_topics(id, title),
          supervisor:profiles!pfe_projects_supervisor_id_fkey(id, full_name)
        )
      `
      )
      .eq('id', data.id)
      .single()

    const d = fullRow || data
    const p = (d as { pfe_projects?: unknown }).pfe_projects
    const pp = Array.isArray(p) ? p[0] : p
    const student = pp?.student && (Array.isArray(pp.student) ? pp.student[0] : pp.student)
    const topic = pp?.topic && (Array.isArray(pp.topic) ? pp.topic[0] : pp.topic)
    const supervisor = pp?.supervisor && (Array.isArray(pp.supervisor) ? pp.supervisor[0] : pp.supervisor)
    const defense = {
      ...d,
      pfe_project: pp ? { ...pp, student, topic, supervisor } : null,
    }

    return NextResponse.json({ defense })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
