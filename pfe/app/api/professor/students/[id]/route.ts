import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const userId = auth.user!.id
    const supabase = await createClient()

    // Get student's PFE project supervised by this professor
    const { data: project, error } = await supabase
      .from('pfe_projects')
      .select(`
        id,
        status,
        progress,
        start_date,
        created_at,
        student:profiles!pfe_projects_student_id_fkey(
          id,
          full_name,
          email,
          phone,
          department,
          year
        ),
        topic:pfe_topics(
          id,
          title,
          description
        )
      `)
      .eq('student_id', id)
      .eq('supervisor_id', userId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!project) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 })
    }

    // Handle array responses
    const student = Array.isArray(project.student) ? project.student[0] : project.student
    const topic = Array.isArray(project.topic) ? project.topic[0] : project.topic

    // Get milestones
    const { data: milestones } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('pfe_project_id', project.id)
      .order('order_index', { ascending: true })

    // Get last meeting
    const { data: lastMeeting } = await supabase
      .from('meetings')
      .select('date')
      .eq('pfe_project_id', project.id)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Get all meetings for this student
    const { data: meetings } = await supabase
      .from('meetings')
      .select('*')
      .eq('pfe_project_id', project.id)
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    return NextResponse.json({
      student: {
        id: student?.id,
        name: student?.full_name,
        full_name: student?.full_name,
        email: student?.email,
        phone: student?.phone,
        department: student?.department,
        year: student?.year,
      },
      topic: topic || null,
      status: project.status,
      progress: project.progress || 0,
      startDate: project.start_date,
      lastMeeting: lastMeeting?.date || null,
      milestones: milestones || [],
      meetings: meetings || [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id: studentId } = await params
    const userId = auth.user!.id
    const body = await request.json()
    const { supervisorDefenseReady } = body

    if (typeof supervisorDefenseReady !== 'boolean') {
      return NextResponse.json({ error: 'supervisorDefenseReady (booléen) requis' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: project, error: findErr } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('student_id', studentId)
      .eq('supervisor_id', userId)
      .maybeSingle()

    if (findErr) {
      return NextResponse.json({ error: findErr.message }, { status: 500 })
    }
    if (!project) {
      return NextResponse.json({ error: 'Étudiant non trouvé ou non supervisé par vous' }, { status: 404 })
    }

    const { error: updErr } = await supabase
      .from('pfe_projects')
      .update({ supervisor_defense_ready: supervisorDefenseReady })
      .eq('id', project.id)

    if (updErr) {
      if (updErr.message?.includes('supervisor_defense_ready') || updErr.code === '42703') {
        return NextResponse.json(
          {
            error:
              'Colonne supervisor_defense_ready manquante. Exécutez la migration defenses-scheduling-supervisor-ready.sql.',
          },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, supervisorDefenseReady })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
