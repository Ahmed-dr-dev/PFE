import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const auth = await requireAuth('admin')
    if (auth.error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id } = await params
    
    // Get professor profile
    const { data: professor, error: professorError } = await supabase
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
        )
      `)
      .eq('id', id)
      .eq('role', 'professor')
      .single()

    if (professorError) {
      return NextResponse.json({ error: professorError.message }, { status: 500 })
    }

    if (!professor) {
      return NextResponse.json({ error: 'Enseignant non trouvé' }, { status: 404 })
    }

    // Get students supervised by this professor - query directly from pfe_projects
    const { data: projects, error: projectsError } = await supabase
      .from('pfe_projects')
      .select(`
        id,
        status,
        progress,
        student:profiles!pfe_projects_student_id_fkey(
          id,
          full_name
        )
      `)
      .eq('supervisor_id', id)
      .order('created_at', { ascending: false })

    if (projectsError) {
      return NextResponse.json({ error: projectsError.message }, { status: 500 })
    }

    // Format topics
    const topics = Array.isArray(professor.topics) ? professor.topics : (professor.topics ? [professor.topics] : [])

    // Format students - handle potential array responses
    const students = (projects || []).map((project: any) => {
      const student = Array.isArray(project.student) ? project.student[0] : project.student
      return {
        id: project.id,
        student: student || null,
        progress: project.progress || 0,
        status: project.status,
      }
    })
    return NextResponse.json({
      professor: {
        id: professor.id,
        name: professor.full_name,
        full_name: professor.full_name,
        email: professor.email,
        phone: professor.phone,
        department: professor.department,
        office: professor.office,
        office_hours: professor.office_hours,
        bio: professor.bio,
        expertise: professor.expertise,
      },
      topics: topics,
      students: students,
      topicsCount: topics.length,
      studentsCount: students.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
