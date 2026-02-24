import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const supabase = await createClient()
    const { data: projectIds } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('supervisor_id', auth.user!.id)
    const ids = (projectIds || []).map((p) => p.id)
    if (ids.length === 0) return NextResponse.json({ defenses: [] })

    const { data, error } = await supabase
      .from('defenses')
      .select(`
        *,
        pfe_projects(
          id,
          student_id,
          topic_id,
          student:profiles!pfe_projects_student_id_fkey(id, full_name, email),
          topic:pfe_topics(id, title)
        )
      `)
      .in('pfe_project_id', ids)
      .order('scheduled_date', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const defenses = (data || []).map((d: { pfe_projects: unknown }) => {
      const p = d.pfe_projects
      const pp = Array.isArray(p) ? p[0] : p
      const student = pp?.student && (Array.isArray(pp.student) ? pp.student[0] : pp.student)
      const topic = pp?.topic && (Array.isArray(pp.topic) ? pp.topic[0] : pp.topic)
      return { ...d, pfe_projects: pp ? { ...pp, student, topic } : null }
    })
    return NextResponse.json({ defenses })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
