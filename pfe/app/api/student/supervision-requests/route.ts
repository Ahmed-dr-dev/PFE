import { requireAuth } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const supabase = await createClient()
    const studentId = auth.user!.id

    const { data: activePfe } = await supabase
      .from('pfe_projects')
      .select('supervisor_id, status')
      .eq('student_id', studentId)
      .eq('status', 'approved')
      .maybeSingle()

    const { data: requests, error } = await supabase
      .from('supervision_requests')
      .select(`
        id,
        professor_id,
        message,
        preferred_topic_id,
        suggested_topic_title,
        status,
        created_at,
        updated_at,
        professor:profiles!supervision_requests_professor_id_fkey(id, full_name, email, department),
        topic:pfe_topics!supervision_requests_preferred_topic_id_fkey(id, title)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const staleAcceptedIds = (requests || [])
      .filter((r: any) => {
        if (r.status !== 'accepted') return false
        if (!activePfe?.supervisor_id) return true
        return activePfe.supervisor_id !== r.professor_id
      })
      .map((r: any) => r.id)

    const stalePendingIds = !activePfe?.supervisor_id
      ? (requests || [])
          .filter((r: any) => {
            if (r.status !== 'pending') return false
            if (!r.updated_at || !r.created_at) return false
            return new Date(r.updated_at).getTime() > new Date(r.created_at).getTime()
          })
          .map((r: any) => r.id)
      : []

    const staleIds = Array.from(new Set([...staleAcceptedIds, ...stalePendingIds]))

    if (staleIds.length > 0) {
      await supabase
        .from('supervision_requests')
        .delete()
        .in('id', staleIds)
    }

    const staleAcceptedSet = new Set(staleIds)
    const formatted = (requests || [])
      .filter((r: any) => !staleAcceptedSet.has(r.id))
      .map((r: any) => {
      const professor = Array.isArray(r.professor) ? r.professor[0] : r.professor
      const topic = Array.isArray(r.topic) ? r.topic[0] : r.topic
      return {
        ...r,
        professor,
        topic: topic || null,
      }
    })
    return NextResponse.json({ requests: formatted })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const supabase = await createClient()
    const body = await request.json()
    const { professorId, message } = body
    const preferredTopicIdRaw =
      typeof body.preferredTopicId === 'string' && body.preferredTopicId.trim() ? body.preferredTopicId.trim() : null
    const suggestedRaw = typeof body.suggestedTopicTitle === 'string' ? body.suggestedTopicTitle.trim().slice(0, 500) : ''
    const suggestedTopicTitle = suggestedRaw || null

    if (!professorId) {
      return NextResponse.json({ error: 'Encadrant requis' }, { status: 400 })
    }
    if (preferredTopicIdRaw && suggestedTopicTitle) {
      return NextResponse.json(
        { error: 'Choisissez soit un sujet existant, soit une proposition de sujet, pas les deux' },
        { status: 400 }
      )
    }

    let preferredTopicId: string | null = preferredTopicIdRaw
    if (preferredTopicId) {
      const { data: topicRow } = await supabase
        .from('pfe_topics')
        .select('id, status, professor_id')
        .eq('id', preferredTopicId)
        .maybeSingle()
      if (!topicRow || topicRow.status !== 'approved') {
        return NextResponse.json({ error: 'Sujet introuvable ou non validé' }, { status: 400 })
      }
      if (topicRow.professor_id !== professorId) {
        return NextResponse.json(
          {
            error:
              'Choisissez un sujet proposé par cet encadrant, ou proposez votre propre titre / sans préciser le sujet.',
          },
          { status: 400 }
        )
      }
    }

    const messageTrimmed = typeof message === 'string' ? message.trim().slice(0, 4000) : ''
    const messageFinal = messageTrimmed || null

    const studentId = auth.user!.id

    // Student already has a supervisor?
    const { data: existingPfe } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('student_id', studentId)
      .eq('status', 'approved')
      .maybeSingle()
    if (existingPfe) {
      return NextResponse.json({ error: 'Vous avez déjà un encadrant assigné' }, { status: 400 })
    }

    // Same professor: no duplicate pending; rejected row is reopened as pending (UNIQUE pair)
    const { data: existingReq } = await supabase
      .from('supervision_requests')
      .select('id, status')
      .eq('student_id', studentId)
      .eq('professor_id', professorId)
      .maybeSingle()
    if (existingReq) {
      if (existingReq.status === 'pending') {
        return NextResponse.json({ error: 'Vous avez déjà une demande en attente auprès de cet encadrant' }, { status: 400 })
      }
      if (existingReq.status === 'accepted') {
        return NextResponse.json({ error: 'Cet encadrant vous a déjà accepté' }, { status: 400 })
      }
      if (existingReq.status === 'rejected') {
        const now = new Date().toISOString()
        const { data: reopened, error: reopenErr } = await supabase
          .from('supervision_requests')
          .update({
            status: 'pending',
            message: messageFinal,
            preferred_topic_id: preferredTopicId,
            suggested_topic_title: suggestedTopicTitle,
            updated_at: now,
          })
          .eq('id', existingReq.id)
          .select()
          .single()
        if (reopenErr) {
          return NextResponse.json({ error: reopenErr.message }, { status: 500 })
        }
        const notifParts: string[] = []
        if (preferredTopicId) notifParts.push('demande avec sujet (catalogue)')
        if (suggestedTopicTitle) notifParts.push('demande avec sujet (proposition)')
        if (messageFinal) notifParts.push('message joint')
        await createNotification(supabase, {
          recipientId: professorId,
          type: 'supervision_request',
          title: 'Demande d’encadrement (relancée)',
          body:
            notifParts.length > 0
              ? `Un étudiant a relancé une demande (${notifParts.join(', ')}).`
              : 'Un étudiant a relancé une demande d’encadrement.',
          link: '/dashboard/professor/supervision-requests',
        })
        return NextResponse.json({ request: reopened })
      }
    }

    const { data: req, error } = await supabase
      .from('supervision_requests')
      .insert({
        student_id: studentId,
        professor_id: professorId,
        message: messageFinal,
        preferred_topic_id: preferredTopicId,
        suggested_topic_title: suggestedTopicTitle,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Demande déjà envoyée à cet encadrant' }, { status: 400 })
      }
      if (error.message?.includes('preferred_topic_id') || error.code === '42703') {
        return NextResponse.json(
          {
            error:
              'Colonnes sujet manquantes. Exécutez la migration SQL supervision-requests-topic-choice.sql dans Supabase.',
          },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    const notifParts: string[] = []
    if (preferredTopicId) notifParts.push('demande avec sujet (catalogue)')
    if (suggestedTopicTitle) notifParts.push('demande avec sujet (proposition)')
    if (messageFinal) notifParts.push('message')
    await createNotification(supabase, {
      recipientId: professorId,
      type: 'supervision_request',
      title: 'Nouvelle demande d’encadrement',
      body:
        notifParts.length > 0
          ? `Un étudiant souhaite être encadré par vous (${notifParts.join(', ')}).`
          : 'Un étudiant souhaite être encadré par vous.',
      link: '/dashboard/professor/supervision-requests',
    })
    return NextResponse.json({ request: req })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
