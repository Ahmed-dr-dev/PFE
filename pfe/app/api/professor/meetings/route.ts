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

    // Format meetings
    const formattedMeetings = (meetings || []).map((meeting: any) => {
      const student = Array.isArray(meeting.student) ? meeting.student[0] : meeting.student
      return {
        ...meeting,
        student: student || null,
      }
    })

    return NextResponse.json({ meetings: formattedMeetings })
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

    const audienceType = audience === 'group' ? 'group' : 'individual'

    if (audienceType === 'individual') {
      if (!student_id) {
        return NextResponse.json({ error: 'Sélectionnez un étudiant' }, { status: 400 })
      }
      const { data: project } = await supabase
        .from('pfe_projects')
        .select('id')
        .eq('student_id', student_id)
        .eq('supervisor_id', userId)
        .maybeSingle()
      if (!project) {
        return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 })
      }
      const { data: meeting, error } = await supabase
        .from('meetings')
        .insert({
          pfe_project_id: project.id,
          student_id,
          supervisor_id: userId,
          date,
          time,
          duration: duration || 60,
          type: type || 'Suivi',
          notes: notes || null,
          location: location || null,
          status: 'planned',
          audience_type: 'individual',
        })
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ meeting })
    }

    // group: create one meeting per supervised student
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
