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

    // Check if student already has a PFE
    const { data: existingPfe } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('student_id', user.id)
      .maybeSingle()

    if (existingPfe) {
      return NextResponse.json(
        { error: 'Vous avez déjà un PFE assigné' },
        { status: 400 }
      )
    }

    // Check if topic exists and is approved
    const { data: topic } = await supabase
      .from('pfe_topics')
      .select('id, status, professor_id')
      .eq('id', topicId)
      .eq('status', 'approved')
      .maybeSingle()

    if (!topic) {
      return NextResponse.json({ error: 'Sujet non trouvé ou non disponible' }, { status: 404 })
    }

    // Check if already applied
    const { data: existingApplication } = await supabase
      .from('topic_applications')
      .select('id')
      .eq('student_id', user.id)
      .eq('topic_id', topicId)
      .maybeSingle()

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Vous avez déjà postulé pour ce sujet' },
        { status: 400 }
      )
    }

    // Create application
    const { data: application, error } = await supabase
      .from('topic_applications')
      .insert({
        student_id: user.id,
        topic_id: topicId,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
