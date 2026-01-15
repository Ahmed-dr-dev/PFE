import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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

    const { data: projects, error } = await supabase
      .from('pfe_projects')
      .select(`
        id,
        status,
        progress,
        start_date,
        updated_at,
        student:profiles!pfe_projects_student_id_fkey(
          id,
          full_name,
          email,
          department
        ),
        topic:pfe_topics(
          id,
          title
        ),
        supervisor:profiles!pfe_projects_supervisor_id_fkey(
          id,
          full_name
        )
      `)
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format progress data
    const progressList = projects?.map(project => ({
      id: project.id,
      student: project.student?.full_name || 'N/A',
      topic: project.topic?.title || 'N/A',
      supervisor: project.supervisor?.full_name || 'N/A',
      progress: project.progress || 0,
      status: project.status,
      lastUpdate: project.updated_at,
    })) || []

    return NextResponse.json({ progress: progressList })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
