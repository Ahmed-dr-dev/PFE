import { requireAuth } from '@/lib/auth'
      import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const auth = await requireAuth('admin')
    if (auth.error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
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
        pfe:pfe_projects!pfe_projects_student_id_fkey(
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
    const formattedStudents = students?.map(student => {
      const pfe = Array.isArray(student.pfe) ? student.pfe[0] : student.pfe
      const supervisor = pfe && (Array.isArray(pfe.supervisor) ? pfe.supervisor[0] : pfe.supervisor)
      const topic = pfe && (Array.isArray(pfe.topic) ? pfe.topic[0] : pfe.topic)
      
      return {
        id: student.id,
        name: student.full_name,
        full_name: student.full_name,
        email: student.email,
        phone: student.phone,
        department: student.department,
        year: student.year,
        pfeStatus: pfe?.status || null,
        hasPfe: !!pfe,
        supervisor: supervisor?.full_name || null,
        topic: topic?.title || null,
      }
    }) || []

    return NextResponse.json({ students: formattedStudents })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
