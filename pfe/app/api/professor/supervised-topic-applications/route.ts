import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const supabase = await createClient()
    const userId = auth.user!.id

    const { data: myProjects } = await supabase
      .from('pfe_projects')
      .select('student_id')
      .eq('supervisor_id', userId)

    const studentIds = (myProjects || []).map((p: any) => p.student_id).filter(Boolean)
    if (studentIds.length === 0) {
      return NextResponse.json({ applications: [] })
    }

    const { data: applications, error } = await supabase
      .from('topic_applications')
      .select(`
        id,
        student_id,
        topic_id,
        status,
        submitted_at,
        reviewed_at,
        student:profiles!topic_applications_student_id_fkey(id, full_name, email, department, year),
        topic:pfe_topics(id, title, description, requirements, department, professor_id, professor:profiles!pfe_topics_professor_id_fkey(id, full_name))
      `)
      .in('student_id', studentIds)
      .order('submitted_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formatted = (applications || []).map((app: any) => ({
      ...app,
      student: Array.isArray(app.student) ? app.student[0] : app.student,
      topic: Array.isArray(app.topic) ? app.topic[0] : app.topic,
    }))

    return NextResponse.json({ applications: formatted })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
