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

    // Get student's PFE project to find meetings
    const { data: pfe } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('student_id', auth.user!.id)
      .maybeSingle()

    if (!pfe) {
      return NextResponse.json({ meetings: [] })
    }

    // Get meetings for this student
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('student_id', auth.user!.id)
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ meetings: meetings || [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
