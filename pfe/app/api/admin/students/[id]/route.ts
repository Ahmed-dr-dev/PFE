import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }>  }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await requireAuth('admin')
    if (auth.error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
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
        pfe:pfe_projects!pfe_projects_student_id_fkey(
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
      .eq('id', id)
      .eq('role', 'student')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!student) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 })
    }

    // Format PFE data - handle potential array responses
    const rawPfe = Array.isArray(student.pfe) ? student.pfe[0] : student.pfe
    const pfe = rawPfe || null
    
    // Format nested relationships
    const topic = pfe && (Array.isArray(pfe.topic) ? pfe.topic[0] : pfe.topic)
    const supervisor = pfe && (Array.isArray(pfe.supervisor) ? pfe.supervisor[0] : pfe.supervisor)

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.full_name,
        full_name: student.full_name,
        email: student.email,
        phone: student.phone,
        department: student.department,
        year: student.year,
      },
      pfe: pfe ? {
        id: pfe.id,
        status: pfe.status,
        progress: pfe.progress || 0,
        start_date: pfe.start_date,
      } : null,
      topic: topic || null,
      supervisor: supervisor || null,
      status: pfe?.status || null,
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
