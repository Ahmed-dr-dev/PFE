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

    const { data: student, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        department,
        year,
        pfe:pfe_projects(
          id,
          status,
          progress,
          start_date,
          created_at,
          supervisor:profiles!pfe_projects_supervisor_id_fkey(
            id,
            full_name,
            email
          ),
          topic:pfe_topics(
            id,
            title,
            description
          )
        )
      `)
      .eq('id', params.id)
      .eq('role', 'student')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!student) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 })
    }

    const pfe = student.pfe?.[0]

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.full_name,
        email: student.email,
        phone: student.phone,
        department: student.department,
        year: student.year,
      },
      topic: pfe?.topic || null,
      supervisor: pfe?.supervisor || null,
      status: pfe?.status || 'pending',
      progress: pfe?.progress || 0,
      startDate: pfe?.start_date || null,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
