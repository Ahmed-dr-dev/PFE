import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const supabase = await createClient()

    // Get student's PFE project - must be approved by admin
    const { data: pfe } = await supabase
      .from('pfe_projects')
      .select('supervisor_id, status')
      .eq('student_id', auth.user!.id)
      .eq('status', 'approved') // Only approved PFE projects can see topics
      .maybeSingle()

    if (!pfe || !pfe.supervisor_id) {
      return NextResponse.json({ error: 'Aucun encadrant assigné ou affectation non approuvée' }, { status: 404 })
    }

    const supervisorId = pfe.supervisor_id

    // Check if student already applied (to allow viewing rejected topics)
    const { data: application } = await supabase
      .from('topic_applications')
      .select('id, status')
      .eq('student_id', auth.user!.id)
      .eq('topic_id', id)
      .maybeSingle()

    // Get topic from supervisor
    // Allow viewing if student has applied (even if rejected) or if topic is available
    const { data: topic, error } = await supabase
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
          email,
          phone,
          office,
          office_hours,
          bio,
          expertise
        )
      `)
      .eq('id', id)
      .eq('professor_id', supervisorId)
      .eq('status', 'approved')
      .single()

    if (error || !topic) {
      // If topic not found but student has applied, still allow viewing
      if (application) {
        return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 })
    }

    // Check if topic is reserved by another student
    const { data: reservedBy } = await supabase
      .from('pfe_projects')
      .select('student_id')
      .eq('topic_id', id)
      .not('student_id', 'eq', auth.user!.id)
      .maybeSingle()

    // If topic is reserved and student hasn't applied, deny access
    if (reservedBy && !application) {
      return NextResponse.json({ error: 'Ce sujet n\'est plus disponible' }, { status: 404 })
    }

    // Check if student has a topic assigned
    const { data: studentPfe } = await supabase
      .from('pfe_projects')
      .select('id, topic_id')
      .eq('student_id', auth.user!.id)
      .maybeSingle()

    const professor = Array.isArray(topic.professor) ? topic.professor[0] : topic.professor

    return NextResponse.json({
      topic: {
        ...topic,
        professor: professor || null,
      },
      application: application || null,
      hasTopic: !!studentPfe?.topic_id,
      currentTopicId: studentPfe?.topic_id || null,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
