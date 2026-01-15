import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    // Get all meetings for this professor with student info
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select(`
        id,
        date,
        time,
        duration,
        type,
        notes,
        location,
        status,
        student:profiles!meetings_student_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('supervisor_id', userId)
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format meetings
    const formattedMeetings = (meetings || []).map((meeting: any) => {
      const student = Array.isArray(meeting.student) ? meeting.student[0] : meeting.student
      return {
        ...meeting,
        student: student || null,
      }
    })

    return NextResponse.json({ meetings: formattedMeetings })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
