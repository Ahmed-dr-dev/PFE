import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const DEADLINE_KEYS = [
  'topic_submission_deadline',
  'internship_request_deadline',
  'defense_registration_deadline',
] as const

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('platform_settings')
      .select('key, value, description')
      .in('key', [...DEADLINE_KEYS])

    if (error) {
      return NextResponse.json({ deadlines: [] })
    }

    const byKey = new Map((data || []).map((row) => [row.key, row]))
    const deadlines = DEADLINE_KEYS.map((key) => {
      const row = byKey.get(key)
      return {
        key,
        value: row?.value || '',
        description: row?.description || null,
      }
    })

    return NextResponse.json({ deadlines })
  } catch {
    return NextResponse.json({ deadlines: [] })
  }
}
