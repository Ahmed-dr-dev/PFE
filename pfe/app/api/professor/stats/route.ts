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

    // Count topics proposed
    const { count: topicsCount } = await supabase
      .from('pfe_topics')
      .select('*', { count: 'exact', head: true })
      .eq('professor_id', userId)

    // Count students supervised
    const { count: studentsCount } = await supabase
      .from('pfe_projects')
      .select('*', { count: 'exact', head: true })
      .eq('supervisor_id', userId)

    // Get professor's topic IDs
    const { data: topics } = await supabase
      .from('pfe_topics')
      .select('id')
      .eq('professor_id', userId)

    const topicIds = topics?.map(t => t.id) || []

    // Count pending applications
    let applicationsCount = 0
    if (topicIds.length > 0) {
      const { count } = await supabase
        .from('topic_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .in('topic_id', topicIds)
      
      applicationsCount = count || 0
    }

    return NextResponse.json({
      topicsProposed: topicsCount || 0,
      studentsSupervised: studentsCount || 0,
      pendingApplications: applicationsCount || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
