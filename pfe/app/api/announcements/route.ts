import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const role = auth.user?.role
    const supabase = await createClient()
    let query = supabase.from('announcements').select('id, title, content, target_audience, created_at').order('created_at', { ascending: false })

    if (role === 'student') {
      query = query.or('target_audience.eq.all,target_audience.eq.students')
    } else if (role === 'professor') {
      query = query.or('target_audience.eq.all,target_audience.eq.professors')
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ announcements: data || [] })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
