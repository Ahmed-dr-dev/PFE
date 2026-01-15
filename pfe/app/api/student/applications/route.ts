import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: applications, error } = await supabase
      .from('topic_applications')
      .select(`
        id,
        status,
        submitted_at,
        reviewed_at,
        topic:pfe_topics(
          id,
          title,
          description,
          department,
          professor_id,
          professor:profiles!pfe_topics_professor_id_fkey(
            id,
            full_name,
            email
          )
        )
      `)
      .eq('student_id', user.id)
      .order('submitted_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ applications: applications || [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
