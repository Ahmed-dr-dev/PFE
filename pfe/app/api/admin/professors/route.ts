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

    const { data: professors, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        department,
        office,
        topics:pfe_topics(
          id
        ),
        students:pfe_projects!pfe_projects_supervisor_id_fkey(
          id
        )
      `)
      .eq('role', 'professor')
      .order('full_name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format professors data
    const formattedProfessors = professors?.map(professor => ({
      id: professor.id,
      name: professor.full_name,
      email: professor.email,
      phone: professor.phone,
      department: professor.department,
      office: professor.office,
      topicsCount: professor.topics?.length || 0,
      studentsCount: professor.students?.length || 0,
    })) || []

    return NextResponse.json({ professors: formattedProfessors })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
