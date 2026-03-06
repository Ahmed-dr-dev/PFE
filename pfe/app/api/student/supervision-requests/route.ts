import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const supabase = await createClient()
    const { data: requests, error } = await supabase
      .from('supervision_requests')
      .select(`
        id,
        professor_id,
        message,
        status,
        created_at,
        professor:profiles!supervision_requests_professor_id_fkey(id, full_name, email, department)
      `)
      .eq('student_id', auth.user!.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formatted = (requests || []).map((r: any) => ({
      ...r,
      professor: Array.isArray(r.professor) ? r.professor[0] : r.professor,
    }))
    return NextResponse.json({ requests: formatted })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const supabase = await createClient()
    const body = await request.json()
    const { professorId, message } = body
    if (!professorId) {
      return NextResponse.json({ error: 'Encadrant requis' }, { status: 400 })
    }

    const studentId = auth.user!.id

    // Student already has a supervisor?
    const { data: existingPfe } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('student_id', studentId)
      .maybeSingle()
    if (existingPfe) {
      return NextResponse.json({ error: 'Vous avez déjà un encadrant assigné' }, { status: 400 })
    }

    // Already requested this professor?
    const { data: existingReq } = await supabase
      .from('supervision_requests')
      .select('id, status')
      .eq('student_id', studentId)
      .eq('professor_id', professorId)
      .maybeSingle()
    if (existingReq) {
      if (existingReq.status === 'pending') {
        return NextResponse.json({ error: 'Vous avez déjà envoyé une demande à cet encadrant' }, { status: 400 })
      }
      if (existingReq.status === 'accepted') {
        return NextResponse.json({ error: 'Cet encadrant vous a déjà accepté' }, { status: 400 })
      }
    }

    const { data: req, error } = await supabase
      .from('supervision_requests')
      .insert({
        student_id: studentId,
        professor_id: professorId,
        message: message || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Demande déjà envoyée à cet encadrant' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ request: req })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
