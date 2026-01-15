import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function PUT(
  request: Request,   
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id, applicationId } = await params
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
      .eq('id', id)
      .single()

    if (!topic || topic.professor_id !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Get application data BEFORE updating (to check restrictions)
    const { data: applicationData } = await supabase
      .from('topic_applications')
      .select('student_id, topic_id, status')
      .eq('id', applicationId)
      .eq('topic_id', id)
      .single()

    if (!applicationData) {
      return NextResponse.json({ error: 'Candidature non trouvée' }, { status: 404 })
    }

    // If approving, check restrictions BEFORE updating
    if (status === 'approved') {
      // Check if student already has an approved topic assigned
      const { data: existingPfeWithTopic } = await supabase
        .from('pfe_projects')
        .select('id, topic_id')
        .eq('student_id', applicationData.student_id)
        .not('topic_id', 'is', null)
        .maybeSingle()

      if (existingPfeWithTopic && existingPfeWithTopic.topic_id !== applicationData.topic_id) {
        return NextResponse.json(
          { error: 'Cet étudiant a déjà un sujet de PFE assigné' },
          { status: 400 }
        )
      }

      // Check if student already has an approved application for another topic
      const { data: otherApprovedApp } = await supabase
        .from('topic_applications')
        .select('id, topic_id')
        .eq('student_id', applicationData.student_id)
        .eq('status', 'approved')
        .neq('topic_id', applicationData.topic_id)
        .maybeSingle()

      if (otherApprovedApp) {
        return NextResponse.json(
          { error: 'Cet étudiant a déjà été approuvé pour un autre sujet' },
          { status: 400 }
        )
      }

      // Check if topic is already assigned to another student
      const { data: existingAssignment } = await supabase
        .from('pfe_projects')
        .select('id, student_id')
        .eq('topic_id', applicationData.topic_id)
        .not('student_id', 'eq', applicationData.student_id)
        .maybeSingle()

      if (existingAssignment) {
        return NextResponse.json(
          { error: 'Ce sujet est déjà assigné à un autre étudiant' },
          { status: 400 }
        )
      }
    }

    // Update application status
    const { data: application, error } = await supabase
      .from('topic_applications')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .eq('topic_id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If approved, update PFE project to assign the topic
    if (status === 'approved') {
        // Update or create PFE project with topic assignment
        const { data: existingPfe } = await supabase
          .from('pfe_projects')
          .select('id')
          .eq('student_id', applicationData.student_id)
          .maybeSingle()

        if (existingPfe) {
          // Update existing PFE project to assign the topic
          await supabase
            .from('pfe_projects')
            .update({
              topic_id: applicationData.topic_id,
              status: 'approved',
              start_date: new Date().toISOString().split('T')[0],
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingPfe.id)
        } else {
          // Create new PFE project
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

    return NextResponse.json({ success: true, application })
  } catch (error) { 
    console.error('Error updating application:', error) 
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }

}
