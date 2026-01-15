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

    // Get all PFE projects (assignments)
    const { data: assignments, error } = await supabase
      .from('pfe_projects')
      .select(`
        id,
        status,
        start_date,
        created_at,
        student_id,
        topic_id,
        supervisor_id,
        student:profiles!pfe_projects_student_id_fkey(
          id,
          full_name,
          email,
          department,
          year
        ),
        topic:pfe_topics(
          id,
          title,
          professor:profiles!pfe_topics_professor_id_fkey(
            id,
            full_name,
            email
          )
        ),
        supervisor:profiles!pfe_projects_supervisor_id_fkey(
          id,
          full_name,
          email,
          department
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching assignments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format assignments to handle potential array responses from Supabase
    const formattedAssignments = (assignments || []).map((assignment: any) => {
      const student = Array.isArray(assignment.student) ? assignment.student[0] : assignment.student
      const topic = Array.isArray(assignment.topic) ? assignment.topic[0] : assignment.topic
      const supervisor = Array.isArray(assignment.supervisor) ? assignment.supervisor[0] : assignment.supervisor
      const professor = topic && (Array.isArray(topic.professor) ? topic.professor[0] : topic.professor)
      
      return {
        ...assignment,
        student: student || null,
        topic: topic ? {
          ...topic,
          professor: professor || null,
        } : null,
        supervisor: supervisor || null,
      }
    })

    return NextResponse.json({ assignments: formattedAssignments })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireAuth('admin')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { studentId, topicId, supervisorId } = await request.json()

    if (!studentId || !supervisorId) {
      return NextResponse.json(
        { error: 'Étudiant et encadrant requis' },
        { status: 400 }
      )
    }

    // Check if student already has a PFE
    const { data: existingPfe } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('student_id', studentId)
      .maybeSingle()

    if (existingPfe) {
      return NextResponse.json(
        { error: 'L\'étudiant a déjà un PFE assigné' },
        { status: 400 }
      )
    }

    // Create PFE project with pending status (admin will approve/reject)
    const { data: pfeProject, error: pfeError } = await supabase
      .from('pfe_projects')
      .insert({
        student_id: studentId,
        topic_id: topicId || null,
        supervisor_id: supervisorId,
        status: 'pending', // Admin will approve or reject
      })
      .select()
      .single()

    if (pfeError) {
      return NextResponse.json({ error: pfeError.message }, { status: 500 })
    }

    return NextResponse.json({ assignment: pfeProject })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
