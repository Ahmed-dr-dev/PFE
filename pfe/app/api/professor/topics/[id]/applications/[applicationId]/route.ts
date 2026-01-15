import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: { id: string; applicationId: string } }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    const { status } = await request.json()

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    // Verify topic ownership
    const { data: topic } = await supabase
      .from('pfe_topics')
      .select('id, professor_id')
      .eq('id', params.id)
      .single()

    if (!topic || topic.professor_id !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Update application status
    const { data: application, error } = await supabase
      .from('topic_applications')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', params.applicationId)
      .eq('topic_id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If approved, create PFE project
    if (status === 'approved') {
      const { data: applicationData } = await supabase
        .from('topic_applications')
        .select('student_id, topic_id')
        .eq('id', params.applicationId)
        .single()

      if (applicationData) {
        // Check if student already has a PFE
        const { data: existingPfe } = await supabase
          .from('pfe_projects')
          .select('id')
          .eq('student_id', applicationData.student_id)
          .maybeSingle()

        if (!existingPfe) {
          await supabase
            .from('pfe_projects')
            .insert({
              student_id: applicationData.student_id,
              topic_id: applicationData.topic_id,
              supervisor_id: userId,
              status: 'approved',
              start_date: new Date().toISOString().split('T')[0],
            })
        }
      }
    }

    return NextResponse.json({ application })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
