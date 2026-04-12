import { requireAuth } from '@/lib/auth'
import { getSupabaseForAdminData } from '@/lib/supabase/admin-server'
import { NextResponse } from 'next/server'

// GET /api/professor/jury-defenses
// Returns defenses where the authenticated professor is the Président du jury
// (jury_professor_ids[2], i.e. the 3rd member of the jury array)
export async function GET() {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const userId = auth.user!.id
    const supabase = await getSupabaseForAdminData()

    // Fetch all defenses where the professor appears anywhere in jury_professor_ids,
    // then filter server-side to only those where he is index 2 (president)
    const { data, error } = await supabase
      .from('defenses')
      .select(`
        *,
        pfe_projects(
          id,
          student_id,
          topic_id,
          student:profiles!pfe_projects_student_id_fkey(id, full_name, email),
          topic:pfe_topics(id, title),
          supervisor:profiles!pfe_projects_supervisor_id_fkey(id, full_name)
        )
      `)
      .contains('jury_professor_ids', [userId])
      .order('scheduled_date', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const defenses = (data || [])
      .filter((d: any) => {
        const ids: string[] = d.jury_professor_ids || []
        return ids[2] === userId // index 2 = Président du jury
      })
      .map((d: any) => {
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
