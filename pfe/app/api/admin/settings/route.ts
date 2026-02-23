import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
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

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const supabase = await createClient()

    for (const [key, value] of Object.entries(body)) {
      const { error: upsertErr } = await supabase
        .from('platform_settings')
        .upsert({ key, value: String(value ?? ''), updated_at: new Date().toISOString() }, { onConflict: 'key' })
      if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 })
    }

    const { data } = await supabase.from('platform_settings').select('*')
    const settings = (data || []).reduce((acc: Record<string, string>, row: { key: string; value: string }) => {
      acc[row.key] = row.value
      return acc
    }, {})
    return NextResponse.json({ settings })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
