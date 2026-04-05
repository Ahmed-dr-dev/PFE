import { parseRecoveryEmailBody } from '@/lib/auth/recovery-email'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

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
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    const body = await request.json()

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if ('full_name' in body) updates.full_name = body.full_name
    if ('phone' in body) updates.phone = body.phone
    if ('department' in body) updates.department = body.department
    if ('office' in body) updates.office = body.office
    if ('office_hours' in body) updates.office_hours = body.office_hours
    if ('bio' in body) updates.bio = body.bio
    if ('expertise' in body) {
      updates.expertise = Array.isArray(body.expertise) ? body.expertise : null
    }

    if ('recovery_email' in body) {
      const p = parseRecoveryEmailBody(body.recovery_email)
      if (p.kind === 'invalid') {
        return NextResponse.json({ error: p.message }, { status: 400 })
      }
      if (p.kind === 'clear') updates.recovery_email = null
      if (p.kind === 'set') updates.recovery_email = p.email
    }

    const keys = Object.keys(updates).filter((k) => k !== 'updated_at')
    if (keys.length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 })
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
