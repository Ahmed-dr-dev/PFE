import { requireAuth } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { id } = await params
    const body = await request.json()
    const { status } = body
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide (accepted ou rejected)' }, { status: 400 })
    }

    const supabase = await createClient()
    const professorId = auth.user!.id

    const { data: req, error: fetchError } = await supabase
      .from('supervision_requests')
      .select('id, student_id, status, preferred_topic_id, suggested_topic_title')
      .eq('id', id)
      .eq('professor_id', professorId)
      .single()

    if (fetchError || !req) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }
    if (req.status !== 'pending') {
      return NextResponse.json({ error: 'Cette demande a déjà été traitée' }, { status: 400 })
    }

    if (status === 'accepted') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('supervision_capacity')
        .eq('id', professorId)
        .single()

      const capacity = profile?.supervision_capacity ?? 8

      const { data: existingProjects } = await supabase
        .from('pfe_projects')
        .select('id, student:profiles!pfe_projects_student_id_fkey(id)')
        .eq('supervisor_id', professorId)

      const currentCount = (existingProjects || []).filter((p: any) => {
        const s = Array.isArray(p.student) ? p.student[0] : p.student
        return !!s?.id
      }).length

      if (currentCount >= capacity) {
        return NextResponse.json(
          { error: `Capacité d'encadrement atteinte (${currentCount}/${capacity})` },
          { status: 400 }
        )
      }

      // Check student doesn't already have a PFE
      const { data: existingPfe } = await supabase
        .from('pfe_projects')
        .select('id')
        .eq('student_id', req.student_id)
        .maybeSingle()
      if (existingPfe) {
        await supabase
          .from('supervision_requests')
          .update({ status: 'rejected', updated_at: new Date().toISOString() })
          .eq('id', id)
        return NextResponse.json({ error: "L'étudiant a déjà un encadrant" }, { status: 400 })
      }

      let resolvedTopicId: string | null = null
      const preferredId = req.preferred_topic_id as string | null | undefined
      const suggestedTitle = (req.suggested_topic_title as string | null | undefined)?.trim() || ''

      if (preferredId) {
        const { data: topicRow } = await supabase
          .from('pfe_topics')
          .select('id, status, professor_id')
          .eq('id', preferredId)
          .maybeSingle()
        if (!topicRow || topicRow.status !== 'approved' || topicRow.professor_id !== professorId) {
          return NextResponse.json(
            { error: 'Le sujet demandé est invalide ou ne vous appartient pas.' },
            { status: 400 }
          )
        }
        const { data: topicTaken } = await supabase
          .from('pfe_projects')
          .select('id')
          .eq('topic_id', preferredId)
          .neq('student_id', req.student_id)
          .limit(1)
          .maybeSingle()
        if (topicTaken) {
          return NextResponse.json(
            { error: 'Ce sujet du catalogue est déjà attribué à un autre étudiant.' },
            { status: 400 }
          )
        }
        resolvedTopicId = preferredId
      } else if (suggestedTitle) {
        const { data: newTopic, error: topicErr } = await supabase
          .from('pfe_topics')
          .insert({
            title: suggestedTitle.slice(0, 500),
            description:
              "Sujet proposé par l'étudiant dans sa demande d'encadrement. À détailler avec l'encadrant.",
            requirements: null,
            department: null,
            professor_id: professorId,
            status: 'approved',
          })
          .select('id')
          .single()
        if (topicErr) {
          return NextResponse.json({ error: topicErr.message }, { status: 500 })
        }
        resolvedTopicId = newTopic.id
      }

      const startDate = new Date().toISOString().split('T')[0]
      const { error: insertError } = await supabase
        .from('pfe_projects')
        .insert({
          student_id: req.student_id,
          supervisor_id: professorId,
          topic_id: resolvedTopicId,
          status: 'approved',
          start_date: startDate,
        })
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from('supervision_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await createNotification(supabase, {
      recipientId: req.student_id,
      type: 'supervision_decision',
      title: status === 'accepted' ? 'Demande d’encadrement acceptée' : 'Demande d’encadrement refusée',
      body:
        status === 'accepted'
          ? 'Votre encadrant a accepté votre demande. Votre sujet PFE est enregistré sur votre fiche de projet.'
          : 'Votre demande d’encadrement a été refusée.',
      link: '/dashboard/student/supervision',
    })

    return NextResponse.json({ request: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
