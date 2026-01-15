import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    // Get student's PFE project
    const { data: project } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('student_id', params.id)
      .eq('supervisor_id', userId)
      .maybeSingle()

    if (!project) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 })
    }

    // Get meetings
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('pfe_project_id', project.id)
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ meetings: meetings || [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    const { date, time, duration, type, notes, location } = await request.json()

    if (!date || !time) {
      return NextResponse.json(
        { error: 'Date et heure requises' },
        { status: 400 }
      )
    }

    // Get student's PFE project
    const { data: project } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('student_id', params.id)
      .eq('supervisor_id', userId)
      .maybeSingle()

    if (!project) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 })
    }

    // Create meeting
    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        pfe_project_id: project.id,
        student_id: params.id,
        supervisor_id: userId,
        date,
        time,
        duration: duration || 60,
        type: type || 'Suivi',
        notes: notes || null,
        location: location || null,
        status: 'planned',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create calendar event
    await supabase
      .from('calendar_events')
      .insert({
        pfe_project_id: project.id,
        title: `Réunion ${type || 'Suivi'}`,
        description: notes || null,
        date,
        time,
        type: 'meeting',
        location: location || null,
        created_by: userId,
      })

    return NextResponse.json({ meeting })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
