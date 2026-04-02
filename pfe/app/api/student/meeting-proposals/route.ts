import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const supabase = await createClient()
    const { data: rows, error } = await supabase
      .from('meeting_proposals')
      .select(
        `
        *,
        supervisor:profiles!meeting_proposals_supervisor_id_fkey(id, full_name, email)
      `
      )
      .eq('student_id', auth.user!.id)
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const proposals = (rows || []).map((r: any) => ({
      ...r,
      supervisor: Array.isArray(r.supervisor) ? r.supervisor[0] : r.supervisor,
    }))

    return NextResponse.json({ proposals })
  } catch {
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
    const studentId = auth.user!.id
    const body = await request.json()
    const { date, time, duration_minutes, meeting_type, student_notes } = body

    if (!date || !time) {
      return NextResponse.json({ error: 'Date et heure requises' }, { status: 400 })
    }

    const { data: pfe, error: pfeErr } = await supabase
      .from('pfe_projects')
      .select('id, supervisor_id')
      .eq('student_id', studentId)
      .maybeSingle()

    if (pfeErr || !pfe?.supervisor_id) {
      return NextResponse.json(
        { error: 'Vous devez avoir un encadrant pour proposer une réunion' },
        { status: 400 }
      )
    }

    const { data: inserted, error } = await supabase
      .from('meeting_proposals')
      .insert({
        pfe_project_id: pfe.id,
        student_id: studentId,
        supervisor_id: pfe.supervisor_id,
        proposed_date: date,
        proposed_time: typeof time === 'string' && time.length === 5 ? `${time}:00` : time,
        duration_minutes: typeof duration_minutes === 'number' ? duration_minutes : 60,
        meeting_type: meeting_type?.trim() || 'Suivi',
        student_notes: student_notes?.trim() || null,
        proposed_by: 'student',
        waiting_on: 'professor',
        status: 'negotiating',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Vous avez déjà une proposition en cours avec cet encadrant' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await createNotification(supabase, {
      recipientId: pfe.supervisor_id,
      type: 'meeting_proposal',
      title: 'Proposition de réunion',
      body: `Un étudiant propose le ${date} à ${time}.`,
      link: '/dashboard/professor/meetings',
    })

    return NextResponse.json({ proposal: inserted })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
