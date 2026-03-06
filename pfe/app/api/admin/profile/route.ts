import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function GET() {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
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

    const { password: _p, ...profileSafe } = profile ?? {}
    return NextResponse.json({ profile: profileSafe })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    const body = await request.json()
    const { full_name, phone, current_password, new_password } = body

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (full_name != null) updates.full_name = full_name
    if (phone != null) updates.phone = phone

    if (current_password != null && new_password != null) {
      const current = String(current_password).trim()
      const newPwd = String(new_password).trim()
      if (!current) {
        return NextResponse.json({ error: 'Veuillez saisir votre mot de passe actuel' }, { status: 400 })
      }
      if (newPwd.length < 6) {
        return NextResponse.json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
      }
      const { data: existing } = await supabase
        .from('profiles')
        .select('password')
        .eq('id', userId)
        .single()
      if (!existing?.password) {
        return NextResponse.json({ error: 'Impossible de vérifier le mot de passe actuel' }, { status: 400 })
      }
      const currentHash = await hashPassword(current)
      const currentHashDigits = await hashPassword(current.replace(/\D/g, ''))
      const match = existing.password === currentHash || existing.password === currentHashDigits
      if (!match) {
        return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })
      }
      updates.password = await hashPassword(newPwd)
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

    const { password: _, ...profileWithoutPassword } = profile
    return NextResponse.json({ profile: profileWithoutPassword })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
