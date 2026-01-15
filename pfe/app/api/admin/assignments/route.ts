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

    const { data: assignments, error } = await supabase
      .from('assignments')
      .select(`
        id,
        status,
        assigned_at,
        student:profiles!assignments_student_id_fkey(
          id,
          full_name,
          email,
          department
        ),
        topic:pfe_topics(
          id,
          title,
          professor:profiles!pfe_topics_professor_id_fkey(
            id,
            full_name
          )
        ),
        supervisor:profiles!assignments_supervisor_id_fkey(
          id,
          full_name
        )
      `)
      .order('assigned_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ assignments: assignments || [] })
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

    const { studentId, topicId, supervisorId } = await request.json()

    if (!studentId || !topicId || !supervisorId) {
      return NextResponse.json(
        { error: 'Étudiant, sujet et encadrant requis' },
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

    // Create assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .insert({
        student_id: studentId,
        topic_id: topicId,
        supervisor_id: supervisorId,
        status: 'pending',
        assigned_by: user.id,
      })
      .select()
      .single()

    if (assignmentError) {
      return NextResponse.json({ error: assignmentError.message }, { status: 500 })
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
