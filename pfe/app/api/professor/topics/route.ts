import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    // Get all topics by professor
    const { data: topics, error } = await supabase
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
        applications:topic_applications(
          id,
          status,
          student:profiles!topic_applications_student_id_fkey(
            id,
            full_name,
            email
          )
        ),
        projects:pfe_projects(
          id,
          student_id
        )
      `)
      .eq('professor_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format topics with counts
    const formattedTopics = topics?.map(topic => ({
      ...topic,
      applications: topic.applications?.length || 0,
      assigned: topic.projects?.length || 0,
    })) || []

    return NextResponse.json({ topics: formattedTopics })
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

    const { title, description, requirements, department } = await request.json()

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Titre et description requis' },
        { status: 400 }
      )
    }

    const { data: topic, error } = await supabase
      .from('pfe_topics')
      .insert({
        title,
        description,
        requirements: requirements || null,
        department: department || null,
        professor_id: userId,
        status: 'pending', // Needs admin approval
      })
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
