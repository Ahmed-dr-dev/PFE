import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

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
    const { date, time, duration, type, notes, location, audience, student_id } = body

    if (!date || !time) {
      return NextResponse.json({ error: 'Date et heure requises' }, { status: 400 })
    }

    const audienceType = 'group'
    if (audience === 'individual' || student_id) {
      return NextResponse.json(
        { error: "La planification individuelle n'est pas autorisée. Cette page crée une réunion pour tous les étudiants." },
        { status: 400 }
      )
    }

    // Create one meeting per supervised student (group audience)
    const { data: projects } = await supabase
      .from('pfe_projects')
      .select('id, student_id')
      .eq('supervisor_id', userId)
    if (!projects?.length) {
      return NextResponse.json({ error: 'Aucun étudiant encadré' }, { status: 400 })
    }

    const rows = projects.map((p: { id: string; student_id: string }) => ({
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
      audience_type: 'group',
    }))
    const { data: inserted, error } = await supabase.from('meetings').insert(rows).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ meeting: inserted?.[0], created: inserted?.length })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
