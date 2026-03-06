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

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const userId = auth.user!.id
    const supabase = await createClient()
    const body = await request.json()
    const { current_password, new_password } = body

    const current = String(current_password ?? '').trim()
    const newPwd = String(new_password ?? '').trim()
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

    const { error } = await supabase
      .from('profiles')
      .update({ password: await hashPassword(newPwd), updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
