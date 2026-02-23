import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Simple password hashing using Web Crypto API
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
    const { email, password } = await request.json()
    const identifier = typeof email === 'string' ? email.trim() : ''

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Identifiant et mot de passe requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Look up by email (or CIN stored in email) - try exact and ilike for case-insensitivity
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', identifier)
      .maybeSingle()

    if (!profile && !profileError) {
      const { data: profileByIlike } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', identifier)
        .maybeSingle()
      profile = profileByIlike
    }

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Identifiant ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const hashedPasswordDigits = await hashPassword(password.replace(/\D/g, ''))

    const passwordMatch = profile.password === hashedPassword || profile.password === hashedPasswordDigits

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Identifiant ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = profile

    // Set user_id cookie for session management
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })

    response.cookies.set('user_id', profile.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}


