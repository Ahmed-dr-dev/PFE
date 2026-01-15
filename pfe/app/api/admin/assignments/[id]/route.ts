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
    const { data: assignment, error } = await supabase
      .from('pfe_projects')
      .select(`
        id,
        status,
        start_date,
        created_at,
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
          description,
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
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!assignment) {
      return NextResponse.json({ error: 'Affectation non trouvée' }, { status: 404 })
    }

    // Format assignment to handle potential array responses from Supabase
    const student = Array.isArray(assignment.student) ? assignment.student[0] : assignment.student
    const topic = Array.isArray(assignment.topic) ? assignment.topic[0] : assignment.topic
    const supervisor = Array.isArray(assignment.supervisor) ? assignment.supervisor[0] : assignment.supervisor
    const professor = topic && (Array.isArray(topic.professor) ? topic.professor[0] : topic.professor)

    const formattedAssignment = {
      ...assignment,
      student: student || null,
      topic: topic ? {
        ...topic,
        professor: professor || null,
      } : null,
      supervisor: supervisor || null,
    }

    return NextResponse.json({ assignment: formattedAssignment })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const { studentId, topicId, supervisorId, status } = await request.json()

    // Update PFE project
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (studentId) updateData.student_id = studentId
    if (topicId !== undefined) updateData.topic_id = topicId
    if (supervisorId) updateData.supervisor_id = supervisorId
    if (status) {
      updateData.status = status
      // If approving, set start_date if not already set
      if (status === 'approved') {
        // Get current project to check if start_date exists
        const { data: currentProject } = await supabase
          .from('pfe_projects')
          .select('start_date')
          .eq('id', id)
          .single()
        
        if (!currentProject?.start_date) {
          updateData.start_date = new Date().toISOString().split('T')[0]
        }
      }
    }

    const { data: assignment, error } = await supabase
      .from('pfe_projects')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        status,
        start_date,
        created_at,
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
          description,
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
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format assignment to handle potential array responses
    const student = Array.isArray(assignment.student) ? assignment.student[0] : assignment.student
    const topic = Array.isArray(assignment.topic) ? assignment.topic[0] : assignment.topic
    const supervisor = Array.isArray(assignment.supervisor) ? assignment.supervisor[0] : assignment.supervisor
    const professor = topic && (Array.isArray(topic.professor) ? topic.professor[0] : topic.professor)

    const formattedAssignment = {
      ...assignment,
      student: student || null,
      topic: topic ? {
        ...topic,
        professor: professor || null,
      } : null,
      supervisor: supervisor || null,
    }

    return NextResponse.json({ assignment: formattedAssignment })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
