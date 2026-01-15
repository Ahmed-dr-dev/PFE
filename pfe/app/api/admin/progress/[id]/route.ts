import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { data: project, error } = await supabase
      .from('pfe_projects')
      .select(`
        id,
        status,
        progress,
        start_date,
        created_at,
        updated_at,
        student:profiles!pfe_projects_student_id_fkey(
          id,
          full_name,
          email,
          department,
          year
        ),
        topic:pfe_topics(
          id,
          title,
          description
        ),
        supervisor:profiles!pfe_projects_supervisor_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!project) {
      return NextResponse.json({ error: 'PFE non trouvé' }, { status: 404 })
    }

    // Get milestones
    const { data: milestones } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('pfe_project_id', project.id)
      .order('order_index', { ascending: true })

    return NextResponse.json({
      pfe: {
        id: project.id,
        student: {
          name: project.student?.full_name || 'N/A',
          email: project.student?.email || 'N/A',
          department: project.student?.department || 'N/A',
        },
        topic: project.topic,
        supervisor: project.supervisor?.full_name || 'N/A',
        progress: project.progress || 0,
        status: project.status,
        startDate: project.start_date,
        lastUpdate: project.updated_at,
      },
      milestones: milestones || [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
