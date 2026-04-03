import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('support_contact_submissions')
      .select('id, name, email, subject, message, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ submissions: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
