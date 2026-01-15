import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

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
    const { email, password, fullName, role, department, phone, year, office, officeHours, bio, expertise } = await request.json()

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Email, password, full name, and role are required' },
        { status: 400 }
      )
    }

    if (!['student', 'professor', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be student, professor, or admin' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate UUID for user
    const userId = randomUUID()

    // Prepare profile data
    const profileData: any = {
      id: userId,
      full_name: fullName,
      email: email,
      password: hashedPassword,
      role: role,
      phone: phone || null,
      department: department || null,
    }

    // Add role-specific fields
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

    // Insert profile
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message || 'Failed to create user' },
        { status: 400 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newProfile

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

