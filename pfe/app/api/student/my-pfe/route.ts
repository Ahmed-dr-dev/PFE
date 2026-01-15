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

    // Get PFE project with approved topic only (topic_id must be set)
    const { data: pfe, error } = await supabase
      .from('pfe_projects')
      .select(`
        id,
        status,
        progress,
        start_date,
        created_at,
        updated_at,
        topic:pfe_topics(
          id,
          title,
          description,
          requirements,
          department
        ),
        supervisor:profiles!pfe_projects_supervisor_id_fkey(
          id,
          full_name,
          email,
          phone,
          department,
          office,
          office_hours,
          bio,
          expertise
        )
      `)
      .eq('student_id', auth.user!.id)
      .not('topic_id', 'is', null)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!pfe) {
      return NextResponse.json({ pfe: null })
    }

    // Format nested objects to handle potential array responses
    const topic = Array.isArray(pfe.topic) ? pfe.topic[0] : pfe.topic
    const supervisor = Array.isArray(pfe.supervisor) ? pfe.supervisor[0] : pfe.supervisor

    return NextResponse.json({
      pfe: {
        ...pfe,
        topic: topic || null,
        supervisor: supervisor || null,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
