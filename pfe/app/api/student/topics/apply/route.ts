import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { topicId } = await request.json()

    if (!topicId) {
      return NextResponse.json({ error: 'ID du sujet requis' }, { status: 400 })
    }

    // Get student's PFE project - must be approved by admin
    const { data: pfe } = await supabase
      .from('pfe_projects')
      .select('id, topic_id, supervisor_id, status')
      .eq('student_id', auth.user!.id)
      .eq('status', 'approved') // Only approved PFE projects can apply
      .maybeSingle()

    if (!pfe || !pfe.supervisor_id) {
      return NextResponse.json({ error: 'Aucun encadrant assigné ou affectation non approuvée' }, { status: 400 })
    }

    const supervisorId = pfe.supervisor_id

    // Check if student already has a topic assigned
    if (pfe && pfe.topic_id) {
      return NextResponse.json(
        { error: 'Vous avez déjà un sujet de PFE assigné' },
        { status: 400 }
      )
    }

    // Check if student already has an approved application for any topic
    const { data: approvedApplication } = await supabase
      .from('topic_applications')
      .select('id, topic_id')
      .eq('student_id', auth.user!.id)
      .eq('status', 'approved')
      .maybeSingle()

    if (approvedApplication) {
      return NextResponse.json(
        { error: 'Vous avez déjà été approuvé pour un sujet de PFE' },
        { status: 400 }
      )
    }

    // Check if topic exists, is approved, and belongs to student's supervisor
    const { data: topic } = await supabase
      .from('pfe_topics')
      .select('id, status, professor_id')
      .eq('id', topicId)
      .eq('status', 'approved')
      .eq('professor_id', supervisorId)
      .maybeSingle()

    if (!topic) {
      return NextResponse.json({ error: 'Sujet non trouvé ou non disponible' }, { status: 404 })
    }

    // Check if already applied
    const { data: existingApplication } = await supabase
      .from('topic_applications')
      .select('id')
      .eq('student_id', auth.user!.id)
      .eq('topic_id', topicId)
      .maybeSingle()

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Vous avez déjà postulé pour ce sujet' },
        { status: 400 }
      )
    }

    // Create application
    const { data: application, error } = await supabase
      .from('topic_applications')
      .insert({
        student_id: auth.user!.id,
        topic_id: topicId,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
