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
        professor:profiles!pfe_topics_professor_id_fkey(
          id,
          full_name,
          email,
          phone,
          department
        ),
        applications:topic_applications(
          id,
          status,
          submitted_at,
          student:profiles!topic_applications_student_id_fkey(
            id,
            full_name,
            email
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
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!topic) {
      return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ topic })
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
    const auth = await requireAuth('admin')
    if (auth.error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id } = await params
    const { status } = await request.json()

    if (!['approved', 'rejected', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    const { data: topic, error } = await supabase
      .from('pfe_topics')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
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
