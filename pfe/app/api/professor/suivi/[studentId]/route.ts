import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { studentId } = await params
    const userId = auth.user!.id
    const supabase = await createClient()

    const { data: project, error: projectError } = await supabase
      .from('pfe_projects')
      .select(`
        id,
        status,
        progress,
        start_date,
        supervisor_notes,
        student:profiles!pfe_projects_student_id_fkey(
          id,
          full_name,
          email,
          phone,
          department,
          year
        ),
        topic:pfe_topics(id, title, description)
      `)
      .eq('student_id', studentId)
      .eq('supervisor_id', userId)
      .maybeSingle()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 })
    }

    const { data: documents } = await supabase
      .from('documents')
      .select(`
        id,
        name,
        file_path,
        file_type,
        file_size,
        category,
        status,
        professor_review,
        uploaded_at,
        uploaded_by,
        pfe_project_id,
        uploader:profiles!documents_uploaded_by_fkey(full_name, role)
      `)
      .eq('pfe_project_id', project.id)
      .order('uploaded_at', { ascending: false })

    const student = Array.isArray(project.student) ? project.student[0] : project.student
    const topic = Array.isArray(project.topic) ? project.topic[0] : project.topic

    return NextResponse.json({
      student: student ? { id: student.id, full_name: student.full_name, email: student.email, phone: student.phone, department: student.department, year: student.year } : null,
      project: { id: project.id, status: project.status, progress: project.progress, start_date: project.start_date, supervisor_notes: project.supervisor_notes },
      topic: topic || null,
      documents: documents || [],
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { studentId } = await params
    const userId = auth.user!.id
    const supabase = await createClient()

    const body = await request.json()
    const { supervisor_notes } = body

    const { data: project } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('student_id', studentId)
      .eq('supervisor_id', userId)
      .maybeSingle()

    if (!project) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 })
    }

    const { error } = await supabase
      .from('pfe_projects')
      .update({ supervisor_notes: supervisor_notes === '' ? null : supervisor_notes })
      .eq('id', project.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
