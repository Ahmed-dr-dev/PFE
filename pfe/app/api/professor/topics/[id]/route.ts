import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const userId = auth.user!.id
    const supabase = await createClient()

    const { data: topic, error } = await supabase
      .from('pfe_topics')
      .select(`
        id,
        title,
        description,
        requirements,
        department,
        status,
        created_at,
        updated_at,
        professor_id,
        applications:topic_applications(
          id,
          student_id,
          status,
          submitted_at,
          reviewed_at,
          student:profiles!topic_applications_student_id_fkey(
            id,
            full_name,
            email,
            phone,
            department,
            year
          )
        ),
        projects:pfe_projects(
          id,
          student_id,
          status,
          student:profiles!pfe_projects_student_id_fkey(
            id,
            full_name,
            email
          )
        )
      `)
      .eq('id', id)
      .eq('professor_id', userId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!topic) {
      return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 })
    }

    // Only the student's encadrant can approve; add can_review per application
    const applications = (topic.applications || []) as Array<{ student_id?: string; student?: unknown }>
    const studentIds = applications.map((a: any) => a.student_id).filter(Boolean)
    let canReviewMap: Record<string, boolean> = {}
    if (studentIds.length > 0) {
      const { data: pfes } = await supabase
        .from('pfe_projects')
        .select('student_id, supervisor_id')
        .in('student_id', studentIds)
      canReviewMap = (pfes || []).reduce((acc: Record<string, boolean>, p: any) => {
        acc[p.student_id] = p.supervisor_id === userId
        return acc
      }, {})
    }
    const applicationsWithReview = applications.map((app: any) => ({
      ...app,
      student: Array.isArray(app.student) ? app.student[0] : app.student,
      can_review: canReviewMap[app.student_id] ?? false,
    }))

    return NextResponse.json({
      topic: {
        ...topic,
        applications: applicationsWithReview,
      },
    })
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
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const userId = auth.user!.id
    const supabase = await createClient()

    const body = await request.json()
    const { title, description, requirements, department, status } = body

    // Verify ownership
    const { data: existingTopic } = await supabase
      .from('pfe_topics')
      .select('professor_id')
      .eq('id', id)
      .single()

    if (!existingTopic || existingTopic.professor_id !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (requirements !== undefined) updates.requirements = requirements
    if (department !== undefined) updates.department = department
    if (status !== undefined) updates.status = status

    const { data: topic, error } = await supabase
      .from('pfe_topics')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ topic })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
