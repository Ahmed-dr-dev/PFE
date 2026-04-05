import { parseRecoveryEmailBody } from '@/lib/auth/recovery-email'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const userId = auth.user!.id
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*') 
      .eq('id', userId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const userId = auth.user!.id

    const body = await request.json()
    const { full_name, phone, department, year } = body

    const updates: Record<string, unknown> = {
      full_name,
      phone,
      department,
      year,
      updated_at: new Date().toISOString(),
    }

    if ('recovery_email' in body) {
      const p = parseRecoveryEmailBody(body.recovery_email)
      if (p.kind === 'invalid') {
        return NextResponse.json({ error: p.message }, { status: 400 })
      }
      if (p.kind === 'clear') updates.recovery_email = null
      if (p.kind === 'set') updates.recovery_email = p.email
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
