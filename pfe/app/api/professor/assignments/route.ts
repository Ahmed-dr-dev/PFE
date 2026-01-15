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

    // Get all students without PFE
    const { data: allStudents, error: studentsError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        department,
        year
      `)
      .eq('role', 'student')
      .order('full_name', { ascending: true })

    if (studentsError) {
      return NextResponse.json({ error: studentsError.message }, { status: 500 })
    }

    // Get students who already have PFE
    const { data: pfeProjects } = await supabase
      .from('pfe_projects')
      .select('student_id')

    const studentsWithPfe = new Set(pfeProjects?.map(p => p.student_id) || [])

    // Filter out students with PFE
    const availableStudents = allStudents?.filter(student => !studentsWithPfe.has(student.id)) || []

    return NextResponse.json({ students: availableStudents })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    const { studentId } = await request.json()

    if (!studentId) {
      return NextResponse.json(
        { error: 'Étudiant requis' },
        { status: 400 }
      )
    }

    // Check if student already has a PFE project
    const { data: existingPfe } = await supabase
      .from('pfe_projects')
      .select('id, supervisor_id, status')
      .eq('student_id', studentId)
      .maybeSingle()

    if (existingPfe) {
      if (existingPfe.supervisor_id === userId) {
        return NextResponse.json(
          { error: 'Cet étudiant est déjà sous votre supervision' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'L\'étudiant a déjà un encadrant assigné' },
        { status: 400 }
      )
    }

    // Create PFE project with supervisor but no topic (student will apply for topics)
    // Admin needs to approve this (change status from 'pending' to 'approved') before student can see topics
    const { data: pfeProject, error: pfeError } = await supabase
      .from('pfe_projects')
      .insert({
        student_id: studentId,
        supervisor_id: userId,
        topic_id: null, // Student will apply for topics
        status: 'pending', // Waiting for admin approval
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
