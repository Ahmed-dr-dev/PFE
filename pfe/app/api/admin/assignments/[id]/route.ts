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

    const { data: assignment, error } = await supabase
      .from('assignments')
      .select(`
        id,
        status,
        assigned_at,
        student:profiles!assignments_student_id_fkey(
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
        supervisor:profiles!assignments_supervisor_id_fkey(
          id,
          full_name,
          email,
          department
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!assignment) {
      return NextResponse.json({ error: 'Affectation non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const { studentId, topicId, supervisorId, status } = await request.json()

    // Update assignment
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (studentId) updateData.student_id = studentId
    if (topicId) updateData.topic_id = topicId
    if (supervisorId) updateData.supervisor_id = supervisorId
    if (status) updateData.status = status

    const { data: assignment, error } = await supabase
      .from('assignments')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If status is 'assigned', create PFE project
    if (status === 'assigned' && assignment) {
      const { data: assignmentData } = await supabase
        .from('assignments')
        .select('student_id, topic_id, supervisor_id')
        .eq('id', params.id)
        .single()

      if (assignmentData) {
        // Check if PFE project already exists
        const { data: existingPfe } = await supabase
          .from('pfe_projects')
          .select('id')
          .eq('student_id', assignmentData.student_id)
          .maybeSingle()

        if (!existingPfe) {
          await supabase
            .from('pfe_projects')
            .insert({
              student_id: assignmentData.student_id,
              topic_id: assignmentData.topic_id,
              supervisor_id: assignmentData.supervisor_id,
              status: 'approved',
              start_date: new Date().toISOString().split('T')[0],
            })
        }
      }
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
