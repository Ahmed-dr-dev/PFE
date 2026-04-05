import { parseRecoveryEmailBody } from '@/lib/auth/recovery-email'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'
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
    const auth = await requireAuth('admin')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { email, password, fullName, role, department, phone, year, office, officeHours, bio, expertise, recoveryEmail } =
      body

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Email, mot de passe, nom complet et rôle sont requis' },
        { status: 400 }
      )
    }

    if (!['student', 'professor'].includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide. Doit être étudiant ou enseignant' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const userId = randomUUID()

    const profileData: Record<string, unknown> = {
      id: userId,
      full_name: fullName,
      email,
      password: hashedPassword,
      role,
      phone: phone || null,
      department: department || null,
    }

    if (role === 'student' && year) {
      profileData.year = year
    }

    if (role === 'professor') {
      if (office) profileData.office = office
      if (officeHours) profileData.office_hours = officeHours
      if (bio) profileData.bio = bio
      if (expertise && Array.isArray(expertise)) {
        profileData.expertise = expertise
      }
    }

    if (recoveryEmail !== undefined && recoveryEmail !== null && String(recoveryEmail).trim() !== '') {
      const p = parseRecoveryEmailBody(recoveryEmail)
      if (p.kind === 'invalid') {
        return NextResponse.json({ error: p.message }, { status: 400 })
      }
      if (p.kind === 'set') profileData.recovery_email = p.email
    }

    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message || 'Échec de la création du compte' },
        { status: 400 }
      )
    }

    const { password: _, ...userWithoutPassword } = newProfile

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
