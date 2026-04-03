import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const supabase = await createClient()
    const { data: requests, error } = await supabase
      .from('supervision_requests')
      .select(`
        id,
        student_id,
        message,
        preferred_topic_id,
        suggested_topic_title,
        status,
        created_at,
        student:profiles!supervision_requests_student_id_fkey(id, full_name, email, department, year),
        topic:pfe_topics!supervision_requests_preferred_topic_id_fkey(id, title)
      `)
      .eq('professor_id', auth.user!.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formatted = (requests || []).map((r: any) => {
      const topic = Array.isArray(r.topic) ? r.topic[0] : r.topic
      return {
        ...r,
        student: Array.isArray(r.student) ? r.student[0] : r.student,
        topic: topic || null,
      }
    })
    return NextResponse.json({ requests: formatted })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
