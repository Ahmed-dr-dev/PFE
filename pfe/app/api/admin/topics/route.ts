import { requireAuth } from '@/lib/auth'
  import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const auth = await requireAuth('admin')
    if (auth.error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

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
        professor:profiles!pfe_topics_professor_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ topics: topics || [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
