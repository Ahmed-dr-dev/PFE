import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const auth = await requireAuth('student') 
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { data: pfe } = await supabase
      .from('pfe_projects')
      .select('supervisor_id, status')
      .eq('student_id', auth.user!.id)
      .maybeSingle()

    const hasSupervisor = !!pfe?.supervisor_id

    // Get ALL published topics from all professors
    const { data: topics, error } = await supabase
      .from('pfe_topics')
      .select(`
        id,
        title,
        description,
        requirements,
        department,
        status,
        created_at,
        professor_id,
        professor:profiles!pfe_topics_professor_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get topics that are already assigned to other students (reserved)
    // Exclude the current student's own assignment
    const { data: assignedTopics } = await supabase
      .from('pfe_projects')
      .select('topic_id, student_id')
      .not('topic_id', 'is', null)

    const assignedToOtherStudent = new Set(
      assignedTopics
        ?.filter((p: any) => p.student_id !== auth.user!.id && p.topic_id)
        .map((p: any) => p.topic_id as string) || []
    )

    // Get student's applications
    const { data: applications } = await supabase
      .from('topic_applications')
      .select('topic_id, status')
      .eq('student_id', auth.user!.id)

    const applicationMap = new Map(
      applications?.map((app: any) => [app.topic_id, app.status]) || []
    )

    // All students see every published topic; UI uses topicAssignedToOther for availability
    const topicsWithApplications = (topics || []).map((topic: any) => ({
      ...topic,
      applicationStatus: applicationMap.get(topic.id) || null,
      topicAssignedToOther: assignedToOtherStudent.has(topic.id),
    }))

    return NextResponse.json({ topics: topicsWithApplications, hasSupervisor })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
