import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const supabase = await createClient()
    const { data: projects } = await supabase
      .from('pfe_projects')
      .select('student_id')
      .eq('supervisor_id', auth.user!.id)
    const studentIds = (projects || []).map((p) => p.student_id).filter(Boolean)
    if (studentIds.length === 0) return NextResponse.json({ requests: [] })

    const { data, error } = await supabase
      .from('internship_requests')
      .select(`
        *,
        student:profiles!internship_requests_student_id_fkey(id, full_name, email, department)
      `)
      .in('student_id', studentIds)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const requests = (data || []).map((r: { student: unknown }) => ({
      ...r,
      student: Array.isArray(r.student) ? r.student[0] : r.student,
    }))
    return NextResponse.json({ requests })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
