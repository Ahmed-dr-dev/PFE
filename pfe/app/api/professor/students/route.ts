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

    // Get all students supervised by this professor
    const { data: projects, error } = await supabase
      .from('pfe_projects')
      .select(`
        id,
        status,
        progress,
        start_date,
        created_at,
        student:profiles!pfe_projects_student_id_fkey(
          id,
          full_name,
          email,
          phone,
          department,
          year
        ),
        topic:pfe_topics(
          id,
          title,
          description
        )
      `)
      .eq('supervisor_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get last meetings for each project
    const projectIds = projects?.map(p => p.id) || []
    let lastMeetings: Record<string, { date: string; time: string }> = {}
    
    if (projectIds.length > 0) {
      const { data: meetings } = await supabase
        .from('meetings')
        .select('pfe_project_id, date, time')
        .in('pfe_project_id', projectIds)
        .order('date', { ascending: false })
      
      // Get the most recent meeting for each project
      meetings?.forEach(meeting => {
        if (!lastMeetings[meeting.pfe_project_id] || 
            meeting.date > lastMeetings[meeting.pfe_project_id].date) {
          lastMeetings[meeting.pfe_project_id] = {
            date: meeting.date,
            time: meeting.time,
          }
        }
      })
    }

    // Format students data
    const students = projects?.map(project => {
      const lastMeeting = lastMeetings[project.id]
      return {
        id: project.student.id,
        name: project.student.full_name,
        email: project.student.email,
        phone: project.student.phone,
        department: project.student.department,
        year: project.student.year,
        topic: project.topic?.title || 'N/A',
        status: project.status,
        progress: project.progress || 0,
        startDate: project.start_date,
        lastMeeting: lastMeeting ? `${lastMeeting.date}T${lastMeeting.time}` : null,
      }
    }) || []

    return NextResponse.json({ students })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
