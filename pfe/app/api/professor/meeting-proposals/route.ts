import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const supabase = await createClient()
    const profId = auth.user!.id

    const { data: rows, error } = await supabase
      .from('meeting_proposals')
      .select(
        `
        *,
        student:profiles!meeting_proposals_student_id_fkey(id, full_name, email, department)
      `
      )
      .eq('supervisor_id', profId)
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const proposals = (rows || []).map((r: any) => ({
      ...r,
      student: Array.isArray(r.student) ? r.student[0] : r.student,
    }))

    return NextResponse.json({ proposals })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
