import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  return userId || null
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { topicId } = await request.json()

    if (!topicId) {
      return NextResponse.json({ error: 'ID du sujet requis' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user is a student
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!profile || profile.role !== 'student') {
      return NextResponse.json(
        { error: 'Seuls les étudiants peuvent choisir un sujet' },
        { status: 403 }
      )
    }

    // Check if student already has a PFE
    const { data: existingPfe } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('student_id', userId)
      .maybeSingle()

    if (existingPfe) {
      return NextResponse.json(
        { error: 'Vous avez déjà un PFE assigné' },
        { status: 400 }
      )
    }

    // Get topic (must be approved)
    const { data: topic } = await supabase
      .from('pfe_topics')
      .select('id, professor_id, status')
      .eq('id', topicId)
      .eq('status', 'approved')
      .single()

    if (!topic) {
      return NextResponse.json(
        { error: 'Sujet non trouvé ou non disponible' },
        { status: 404 }
      )
    }

    // Check if student already applied to this topic
    const { data: existingApplication } = await supabase
      .from('topic_applications')
      .select('id')
      .eq('student_id', userId)
      .eq('topic_id', topicId)
      .maybeSingle()

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Vous avez déjà postulé pour ce sujet' },
        { status: 400 }
      )
    }

    // Create application (students apply, don't directly get assigned)
    const { data: application, error } = await supabase
      .from('topic_applications')
      .insert({
        student_id: userId,
        topic_id: topicId,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ application })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

