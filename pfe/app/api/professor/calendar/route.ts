import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    // Get all projects supervised by this professor
    const { data: projects } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('supervisor_id', userId)

    const projectIds = projects?.map(p => p.id) || []

    if (projectIds.length === 0) {
      return NextResponse.json({ events: [] })
    }

    // Get meetings
    let meetingsQuery = supabase
      .from('meetings')
      .select(`
        id,
        date,
        time,
        duration,
        type,
        status,
        notes,
        location,
        student:profiles!meetings_student_id_fkey(
          full_name
        )
      `)
      .in('pfe_project_id', projectIds)

    if (month && year) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`
      const endDate = `${year}-${month.padStart(2, '0')}-31`
      meetingsQuery = meetingsQuery.gte('date', startDate).lte('date', endDate)
    }

    const { data: meetings, error: meetingsError } = await meetingsQuery
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (meetingsError) {
      return NextResponse.json({ error: meetingsError.message }, { status: 500 })
    }

    // Get calendar events
    let eventsQuery = supabase
      .from('calendar_events')
      .select('*')
      .in('pfe_project_id', projectIds)

    if (month && year) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`
      const endDate = `${year}-${month.padStart(2, '0')}-31`
      eventsQuery = eventsQuery.gte('date', startDate).lte('date', endDate)
    }

    const { data: events, error: eventsError } = await eventsQuery
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 })
    }

    // Format meetings as events
    const formattedMeetings = meetings?.map(meeting => ({
      id: meeting.id,
      title: `Réunion ${meeting.type} - ${meeting.student?.full_name || ''}`,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      type: 'meeting',
      student: meeting.student?.full_name || '',
      status: meeting.status,
      notes: meeting.notes,
      location: meeting.location,
    })) || []

    // Combine meetings and events
    const allEvents = [...formattedMeetings, ...(events || [])]

    return NextResponse.json({ events: allEvents })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
