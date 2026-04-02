import { requireAuth } from '@/lib/auth'
import { createMeetingFromAgreedProposal, type MeetingProposalRow } from '@/lib/meeting-proposals'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { id } = await params
    const supabase = await createClient()
    const profId = auth.user!.id

    const { data: row, error: fetchErr } = await supabase
      .from('meeting_proposals')
      .select('*')
      .eq('id', id)
      .eq('supervisor_id', profId)
      .single()

    if (fetchErr || !row) {
      return NextResponse.json({ error: 'Proposition introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const { action, date, time, duration_minutes, meeting_type, professor_notes } = body

    if (action === 'reject') {
      if (row.status !== 'negotiating') {
        return NextResponse.json({ error: 'Cette proposition est déjà close' }, { status: 400 })
      }
      const { error: upErr } = await supabase
        .from('meeting_proposals')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (upErr) {
        return NextResponse.json({ error: upErr.message }, { status: 500 })
      }
      await createNotification(supabase, {
        recipientId: row.student_id,
        type: 'meeting_proposal',
        title: 'Proposition de réunion refusée',
        body: "Votre encadrant n'a pas retenu cette demande de réunion.",
        link: '/dashboard/student/meetings',
      })
      return NextResponse.json({ success: true })
    }

    if (row.status !== 'negotiating') {
      return NextResponse.json({ error: 'Cette proposition est déjà close' }, { status: 400 })
    }

    if (action === 'accept') {
      if (row.waiting_on !== 'professor') {
        return NextResponse.json(
          { error: "Ce n'est pas à vous de valider ce créneau pour l'instant" },
          { status: 400 }
        )
      }
      const { meetingId, error: finErr } = await createMeetingFromAgreedProposal(
        supabase,
        row as MeetingProposalRow
      )
      if (finErr || !meetingId) {
        return NextResponse.json({ error: finErr || 'Erreur création réunion' }, { status: 500 })
      }
      await createNotification(supabase, {
        recipientId: row.student_id,
        type: 'meeting_proposal',
        title: 'Réunion confirmée',
        body: `Votre encadrant a accepté le ${row.proposed_date} à ${row.proposed_time}.`,
        link: '/dashboard/student/meetings',
      })
      return NextResponse.json({ success: true, meeting_id: meetingId })
    }

    if (action === 'counter') {
      if (row.waiting_on !== 'professor') {
        return NextResponse.json(
          { error: "L'étudiant doit répondre avant une nouvelle proposition" },
          { status: 400 }
        )
      }
      if (!date || !time) {
        return NextResponse.json({ error: 'Date et heure requises' }, { status: 400 })
      }
      const { error: upErr } = await supabase
        .from('meeting_proposals')
        .update({
          proposed_date: date,
          proposed_time: typeof time === 'string' && time.length === 5 ? `${time}:00` : time,
          duration_minutes:
            typeof duration_minutes === 'number' ? duration_minutes : row.duration_minutes,
          meeting_type: meeting_type?.trim() || row.meeting_type,
          professor_notes: professor_notes?.trim() ?? row.professor_notes,
          proposed_by: 'professor',
          waiting_on: 'student',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (upErr) {
        return NextResponse.json({ error: upErr.message }, { status: 500 })
      }
      await createNotification(supabase, {
        recipientId: row.student_id,
        type: 'meeting_proposal',
        title: 'Nouveau créneau proposé',
        body: `Votre encadrant propose le ${date} à ${time}.`,
        link: '/dashboard/student/meetings',
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
