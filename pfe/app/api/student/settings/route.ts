import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('student')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('platform_settings')
      .select('key, value, description')
      .order('key', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const settings = (data || []).reduce((acc: Record<string, string>, row: { key: string; value: string }) => {
      acc[row.key] = row.value
      return acc
    }, {})
    return NextResponse.json({ settings, items: data || [] })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
