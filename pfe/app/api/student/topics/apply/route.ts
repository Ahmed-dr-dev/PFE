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

    const { data: pfe } = await supabase
      .from('pfe_projects')
      .select('id, topic_id, supervisor_id, status')
      .eq('student_id', auth.user!.id)
      .maybeSingle()

    if (pfe?.topic_id) {
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

    // Check if topic exists and is approved (student can apply to any published topic; submission is to their encadrant)
    const { data: topic } = await supabase
      .from('pfe_topics')
      .select('id, status')
      .eq('id', topicId)
      .eq('status', 'approved')
      .maybeSingle()

    if (!topic) {
      return NextResponse.json({ error: 'Sujet non trouvé ou non disponible' }, { status: 404 })
    }

    const { data: topicTaken } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('topic_id', topicId)
      .maybeSingle()

    if (topicTaken) {
      return NextResponse.json(
        { error: 'Ce sujet est déjà attribué à un étudiant' },
        { status: 400 }
      )
    }

    // Check if already applied
    const { data: existingApplication } = await supabase
      .from('topic_applications')
      .select('id, status')
      .eq('student_id', auth.user!.id)
      .eq('topic_id', topicId)
      .maybeSingle()

    if (existingApplication) {
      if (existingApplication.status === 'rejected') {
        const { error: deleteError } = await supabase
          .from('topic_applications')
          .delete()
          .eq('id', existingApplication.id)
          .eq('student_id', auth.user!.id)

        if (deleteError) {
          return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }
      } else {
        return NextResponse.json(
          { error: 'Vous avez déjà postulé pour ce sujet' },
          { status: 400 }
        )
      }
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
      if ((error.message || '').toLowerCase().includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Vous avez déjà une candidature active. Annulez ou attendez sa décision avant de repostuler.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ application })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
