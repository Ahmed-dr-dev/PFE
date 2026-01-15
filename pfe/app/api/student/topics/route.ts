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

    // Get student's PFE project - must be approved by admin
    const { data: pfe } = await supabase
      .from('pfe_projects')
      .select('supervisor_id, status')
      .eq('student_id', auth.user!.id)
      .eq('status', 'approved') // Only approved PFE projects can see topics
      .maybeSingle()

    if (!pfe || !pfe.supervisor_id) {
      return NextResponse.json({ topics: [], hasSupervisor: false })
    }

    const supervisorId = pfe.supervisor_id

    // Get topics from the student's supervisor only
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
      .eq('professor_id', supervisorId)
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

    const reservedTopicIds = new Set(
      assignedTopics
        ?.filter((p: any) => p.student_id !== auth.user!.id) // Exclude current student
        .map((p: any) => p.topic_id)
        .filter((id: string) => id) || []
    )

    // Get student's applications
    const { data: applications } = await supabase
      .from('topic_applications')
      .select('topic_id, status')
      .eq('student_id', auth.user!.id)

    const applicationMap = new Map(
      applications?.map((app: any) => [app.topic_id, app.status]) || []
    )

    // Filter topics: exclude reserved topics, but include topics the student applied to (even if rejected)
    const filteredTopics = (topics || []).filter((topic: any) => {
      const hasApplication = applicationMap.has(topic.id)
      const isReserved = reservedTopicIds.has(topic.id)
      
      // Show topic if: student has applied to it OR it's not reserved
      return hasApplication || !isReserved
    })

    // Add application status to each topic
    const topicsWithApplications = filteredTopics.map((topic: any) => ({
      ...topic,
      applicationStatus: applicationMap.get(topic.id) || null,
    }))

    return NextResponse.json({ topics: topicsWithApplications, hasSupervisor: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
