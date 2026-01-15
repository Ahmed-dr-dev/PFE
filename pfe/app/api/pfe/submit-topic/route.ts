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

    const { title, description, requirements, department } = await request.json()

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Titre et description requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user profile to verify role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, department')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    // Only professors can submit topics
    if (profile.role !== 'professor') {
      return NextResponse.json(
        { error: 'Seuls les enseignants peuvent proposer des sujets' },
        { status: 403 }
      )
    }

    // Insert topic
    const { data: topic, error } = await supabase
      .from('pfe_topics')
      .insert({
        title,
        description,
        requirements: requirements || null,
        department: department || profile.department || null,
        professor_id: userId,
        status: 'pending', // Topics need admin approval
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ topic })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

