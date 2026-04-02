import type { SupabaseClient } from '@supabase/supabase-js'

export type MeetingProposalRow = {
  id: string
  pfe_project_id: string
  student_id: string
  supervisor_id: string
  proposed_date: string
  proposed_time: string
  duration_minutes: number
  meeting_type: string
  student_notes: string | null
  professor_notes: string | null
  proposed_by: 'student' | 'professor'
  waiting_on: 'professor' | 'student'
  status: 'negotiating' | 'agreed' | 'rejected'
  agreed_meeting_id: string | null
  created_at: string
  updated_at: string
}

export async function createMeetingFromAgreedProposal(
  supabase: SupabaseClient,
  proposal: MeetingProposalRow
): Promise<{ meetingId: string | null; error: string | null }> {
  const { data: meeting, error: mErr } = await supabase
    .from('meetings')
    .insert({
      pfe_project_id: proposal.pfe_project_id,
      student_id: proposal.student_id,
      supervisor_id: proposal.supervisor_id,
      date: proposal.proposed_date,
      time: proposal.proposed_time,
      duration: proposal.duration_minutes,
      type: proposal.meeting_type || 'Suivi',
      notes: [proposal.student_notes, proposal.professor_notes].filter(Boolean).join('\n\n') || null,
      location: null,
      status: 'planned',
      audience_type: 'individual',
    })
    .select('id')
    .single()

  if (mErr || !meeting) {
    return { meetingId: null, error: mErr?.message || 'insert meeting failed' }
  }

  const { error: calErr } = await supabase.from('calendar_events').insert({
    pfe_project_id: proposal.pfe_project_id,
    title: `Réunion ${proposal.meeting_type || 'Suivi'}`,
    description: [proposal.student_notes, proposal.professor_notes].filter(Boolean).join('\n\n') || null,
    date: proposal.proposed_date,
    time: proposal.proposed_time,
    type: 'meeting',
    location: null,
    created_by: proposal.supervisor_id,
  })
  if (calErr) console.warn('calendar_events insert:', calErr.message)

  const { error: uErr } = await supabase
    .from('meeting_proposals')
    .update({
      status: 'agreed',
      agreed_meeting_id: meeting.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', proposal.id)

  if (uErr) {
    return { meetingId: meeting.id, error: uErr.message }
  }

  return { meetingId: meeting.id, error: null }
}
