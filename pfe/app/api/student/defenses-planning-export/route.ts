import { requireAuth } from '@/lib/auth'
import { getSupabaseForAdminData } from '@/lib/supabase/admin-server'
import { NextResponse } from 'next/server'

/** GET — Données pour générer le PDF du planning côté client (aucun fichier stocké). */
export async function GET() {
  try {
    const auth = await requireAuth('student')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const supabase = await getSupabaseForAdminData()
    const { data, error } = await supabase
      .from('defenses')
      .select(`
        *,
        pfe_projects(
          id,
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
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
