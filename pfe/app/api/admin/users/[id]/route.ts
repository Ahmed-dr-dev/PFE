import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { id } = await params
    const body = await request.json()
    const { email, password, fullName, department, phone, year, office, officeHours, bio, expertise } = body

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    if (email) {
      const { data: dup } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .single()
      if (dup) {
        return NextResponse.json({ error: 'Un autre compte utilise déjà cet email' }, { status: 400 })
      }
    }

    const updates: Record<string, unknown> = {}
    if (fullName != null) updates.full_name = fullName
    if (email != null) updates.email = email
    if (department != null) updates.department = department || null
    if (phone != null) updates.phone = phone || null
    if (password && String(password).trim().length >= 6) {
      updates.password = await hashPassword(String(password).trim())
    }
    if (existing.role === 'student' && year != null) updates.year = year || null
    if (existing.role === 'professor') {
      if (office != null) updates.office = office || null
      if (officeHours != null) updates.office_hours = officeHours || null
      if (bio != null) updates.bio = bio || null
      if (expertise !== undefined) updates.expertise = Array.isArray(expertise) ? expertise : []
    }

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    const { password: _, ...out } = updated
    return NextResponse.json({ success: true, user: out })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { id } = await params
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const { error } = await supabase.from('profiles').delete().eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Impossible de supprimer (données liées ?)' },
        { status: 400 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
