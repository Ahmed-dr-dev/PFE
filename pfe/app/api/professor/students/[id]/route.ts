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
      .eq('student_id', params.id)
      .eq('supervisor_id', userId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!project) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 })
    }

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

    return NextResponse.json({
      student: {
        id: project.student.id,
        name: project.student.full_name,
        email: project.student.email,
        phone: project.student.phone,
        department: project.student.department,
        year: project.student.year,
      },
      topic: project.topic,
      status: project.status,
      progress: project.progress || 0,
      startDate: project.start_date,
      lastMeeting: lastMeeting?.date || null,
      milestones: milestones || [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
