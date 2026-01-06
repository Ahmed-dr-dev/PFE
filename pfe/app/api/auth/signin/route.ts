import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const supabase = await createClient()

    const { data, error } = await supabase.from('users').select('*').eq('email', email).eq('password', password)

    if (data && data.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }
    else {
      return NextResponse.json({ success: true, user: data })
    }
}


