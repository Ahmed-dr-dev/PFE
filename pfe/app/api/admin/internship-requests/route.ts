import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('internship_requests')
      .select(`
        *,
        student:profiles!internship_requests_student_id_fkey(id, full_name, email, department, year)
      `)
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

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const { student_id, company, position, description, start_date, end_date } = body
    if (!student_id || !company || !position) {
      return NextResponse.json({ error: 'Étudiant, entreprise et poste requis' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('internship_requests')
      .insert({ student_id, company, position, description, start_date: start_date || null, end_date: end_date || null, status: 'pending' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ request: data })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
