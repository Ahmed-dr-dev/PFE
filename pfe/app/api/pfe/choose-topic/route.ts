import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { topicId } = await request.json()

    if (!topicId) {
      return NextResponse.json({ error: 'ID du sujet requis' }, { status: 400 })
    }

    const { data: existingPfe } = await supabase
      .from('pfe_projects')
      .select('*')
      .eq('student_id', user.id)
      .maybeSingle()

    if (existingPfe) {
      return NextResponse.json(
        { error: 'Vous avez déjà un PFE assigné' },
        { status: 400 }
      )
    }

    const { data: topic } = await supabase
      .from('pfe_topics')
      .select('*, teacher_id')
      .eq('id', topicId)
      .eq('status', 'available')
      .single()

    if (!topic) {
      return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 })
    }

    const { data: project, error } = await supabase
      .from('pfe_projects')
      .insert({
        student_id: user.id,
        topic_id: topicId,
        supervisor_id: topic.teacher_id,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase
      .from('pfe_topics')
      .update({ status: 'taken' })
      .eq('id', topicId)

    return NextResponse.json({ project })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

