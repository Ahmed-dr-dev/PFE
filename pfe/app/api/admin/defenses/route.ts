import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('defenses')
      .select(`
        *,
        pfe_projects(
          id,
          status,
          student_id,
          topic_id,
          supervisor_id,
          student:profiles!pfe_projects_student_id_fkey(id, full_name, email, department),
          topic:pfe_topics(id, title),
          supervisor:profiles!pfe_projects_supervisor_id_fkey(id, full_name)
        )
      `)
      .order('scheduled_date', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const defenses = (data || []).map((d: { pfe_projects: unknown }) => {
      const p = d.pfe_projects
      const pp = Array.isArray(p) ? p[0] : p
      const student = pp?.student && (Array.isArray(pp.student) ? pp.student[0] : pp.student)
      const topic = pp?.topic && (Array.isArray(pp.topic) ? pp.topic[0] : pp.topic)
      const supervisor = pp?.supervisor && (Array.isArray(pp.supervisor) ? pp.supervisor[0] : pp.supervisor)
      return { ...d, pfe_project: pp ? { ...pp, student, topic, supervisor } : null }
    })
    return NextResponse.json({ defenses })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const { pfe_project_id, scheduled_date, scheduled_time, room, jury_members, notes } = body
    if (!pfe_project_id || !scheduled_date) {
      return NextResponse.json({ error: 'Projet PFE et date requis' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('defenses')
      .insert({
        pfe_project_id,
        scheduled_date,
        scheduled_time: scheduled_time || null,
        room: room || null,
        jury_members: Array.isArray(jury_members) ? jury_members : (jury_members ? [jury_members] : []),
        notes: notes || null,
        status: 'scheduled',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ defense: data })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
