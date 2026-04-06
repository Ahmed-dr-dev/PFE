import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

export async function GET() {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    // Get all meetings for this professor with student info
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select(`
        id,
        supervisor_id,
        date,
        time,
        duration,
        type,
        notes,
        location,
        status,
        audience_type,
        student:profiles!meetings_student_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('supervisor_id', userId)
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format + collapse group meetings (stored one row per student)
    const groupMap = new Map<string, any>()
    const formattedMeetings: any[] = []

    for (const meeting of meetings || []) {
      const student = Array.isArray(meeting.student) ? meeting.student[0] : meeting.student
      const formatted = {
        ...meeting,
        student: student || null,
      }

      if (formatted.audience_type !== 'group') {
        formattedMeetings.push(formatted)
        continue
      }

      const key = [
        formatted.supervisor_id,
        formatted.date,
        formatted.time,
        formatted.duration,
        formatted.type || '',
        formatted.location || '',
        formatted.notes || '',
        formatted.status || '',
        formatted.audience_type || 'group',
      ].join('|')

      const existing = groupMap.get(key)
      if (!existing) {
        groupMap.set(key, {
          ...formatted,
          group_size: 1,
        })
      } else {
        existing.group_size += 1
      }
    }

    const collapsedGroupMeetings = Array.from(groupMap.values())
    const allMeetings = [...formattedMeetings, ...collapsedGroupMeetings]
    allMeetings.sort((a: any, b: any) => {
      const aTs = new Date(`${a.date}T${a.time || '00:00:00'}`).getTime()
      const bTs = new Date(`${b.date}T${b.time || '00:00:00'}`).getTime()
      return bTs - aTs
    })

    return NextResponse.json({ meetings: allMeetings })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()
    const body = await request.json()
    const { date, time, duration, type, notes, location, audience, student_id, student_ids } = body

    if (!date || !time) {
      return NextResponse.json({ error: 'Date et heure requises' }, { status: 400 })
    }

    const rawAudience = typeof audience === 'string' ? audience : 'group'
    const audienceMode =
      rawAudience === 'all' || rawAudience === 'group' ? 'all' : rawAudience === 'selected' ? 'selected' : 'individual'

    const { data: projects } = await supabase
      .from('pfe_projects')
      .select('id, student_id')
      .eq('supervisor_id', userId)
    if (!projects?.length) {
      return NextResponse.json({ error: 'Aucun étudiant encadré' }, { status: 400 })
    }

    const byStudent = new Map<string, { id: string; student_id: string }>()
    for (const p of projects as { id: string; student_id: string }[]) {
      if (p.student_id && !byStudent.has(p.student_id)) byStudent.set(p.student_id, p)
    }
    const uniqueProjects = Array.from(byStudent.values())

    let targetProjects: { id: string; student_id: string }[] = uniqueProjects

    if (audienceMode === 'individual') {
      const sid = typeof student_id === 'string' ? student_id.trim() : ''
      if (!sid) {
        return NextResponse.json({ error: 'Sélectionnez un étudiant' }, { status: 400 })
      }
      targetProjects = uniqueProjects.filter((p) => p.student_id === sid)
      if (!targetProjects.length) {
        return NextResponse.json({ error: 'Étudiant non trouvé parmi vos encadrés' }, { status: 400 })
      }
    } else if (audienceMode === 'selected') {
      const ids = Array.isArray(student_ids) ? student_ids.map((x: unknown) => String(x).trim()).filter(Boolean) : []
      if (!ids.length) {
        return NextResponse.json({ error: 'Sélectionnez au moins un étudiant' }, { status: 400 })
      }
      const allowed = new Set(uniqueProjects.map((p) => p.student_id))
      const picked = ids.filter((id: string) => allowed.has(id))
      if (!picked.length) {
        return NextResponse.json({ error: 'Aucun étudiant valide dans la sélection' }, { status: 400 })
      }
      const pickSet = new Set(picked)
      targetProjects = uniqueProjects.filter((p) => pickSet.has(p.student_id))
    }

    const audienceType = audienceMode === 'all' ? 'group' : 'individual'

    const rows = targetProjects.map((p: { id: string; student_id: string }) => ({
      pfe_project_id: p.id,
      student_id: p.student_id,
      supervisor_id: userId,
      date,
      time,
      duration: duration || 60,
      type: type || 'Suivi',
      notes: notes || null,
      location: location || null,
      status: 'planned',
      audience_type: audienceType,
    }))
    const { data: inserted, error } = await supabase.from('meetings').insert(rows).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const seen = new Set<string>()
    for (const p of targetProjects) {
      const sid = p.student_id as string
      if (!sid || seen.has(sid)) continue
      seen.add(sid)
      await createNotification(supabase, {
        recipientId: sid,
        type: 'meeting_planned',
        title: 'Nouvelle réunion planifiée',
        body: `${date} à ${time}${type ? ` — ${type}` : ''}`,
        link: '/dashboard/student/meetings',
      })
    }
    return NextResponse.json({ meeting: inserted?.[0], created: inserted?.length })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
