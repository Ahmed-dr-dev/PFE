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

    const { data: professor, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        department,
        office,
        office_hours,
        bio,
        expertise,
        topics:pfe_topics(
          id,
          title,
          status
        ),
        students:pfe_projects!pfe_projects_supervisor_id_fkey(
          id,
          status,
          progress,
          student:profiles!pfe_projects_student_id_fkey(
            id,
            full_name
          )
        )
      `)
      .eq('id', params.id)
      .eq('role', 'professor')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!professor) {
      return NextResponse.json({ error: 'Enseignant non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      professor: {
        id: professor.id,
        name: professor.full_name,
        email: professor.email,
        phone: professor.phone,
        department: professor.department,
        office: professor.office,
        office_hours: professor.office_hours,
        bio: professor.bio,
        expertise: professor.expertise,
      },
      topics: professor.topics || [],
      students: professor.students || [],
      topicsCount: professor.topics?.length || 0,
      studentsCount: professor.students?.length || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
