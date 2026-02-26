import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .neq('id', userId)
    .order('full_name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ peers: profiles || [] })
}
