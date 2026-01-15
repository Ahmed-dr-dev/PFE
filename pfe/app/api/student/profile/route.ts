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

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        phone,
        department,
        year,
        updated_at: new Date().toISOString(),
      })
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
