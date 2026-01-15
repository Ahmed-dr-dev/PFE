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

    const { data: students, error } = await supabase
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
          supervisor:profiles!pfe_projects_supervisor_id_fkey(
            id,
            full_name
          ),
          topic:pfe_topics(
            id,
            title
          )
        )
      `)
      .eq('role', 'student')
      .order('full_name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format students data
    const formattedStudents = students?.map(student => ({
      id: student.id,
      name: student.full_name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      year: student.year,
      pfeStatus: student.pfe?.[0]?.status || 'pending',
      supervisor: student.pfe?.[0]?.supervisor?.full_name || null,
      topic: student.pfe?.[0]?.topic?.title || null,
    })) || []

    return NextResponse.json({ students: formattedStudents })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
