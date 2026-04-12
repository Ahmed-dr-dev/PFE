import { getSupabaseForAdminData } from '@/lib/supabase/admin-server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

const DOC_STRUCTURE = [
  'Cahier des charges',
  'CHP01', 'CHP02', 'CHP03', 'CHP04',
  'Conclusion', 'Bibliographie', 'Annexes', 'Présentation',
]
const TOTAL_DOCS = DOC_STRUCTURE.length

export async function GET() {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const userId = auth.user!.id
    const supabase = await getSupabaseForAdminData()

    const [{ count: topicsCount }, { count: studentsCount }, { data: topics }] = await Promise.all([
      supabase.from('pfe_topics').select('*', { count: 'exact', head: true }).eq('professor_id', userId),
      supabase.from('pfe_projects').select('*', { count: 'exact', head: true }).eq('supervisor_id', userId),
      supabase.from('pfe_topics').select('id').eq('professor_id', userId),
    ])

    const topicIds = topics?.map((t) => t.id) || []
    let applicationsCount = 0
    if (topicIds.length > 0) {
      const { count } = await supabase
        .from('topic_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .in('topic_id', topicIds)
      applicationsCount = count || 0
    }

    // Most advanced student: most required docs uploaded + validation flags
    let topStudent: {
      id: string
      full_name: string | null
      docsUploaded: number
      docsTotal: number
      appValidated: boolean
      rapportValidated: boolean
      soutenanceValidated: boolean
      topicTitle: string | null
    } | null = null

    const { data: projects } = await supabase
      .from('pfe_projects')
      .select(`
        id,
        app_validated,
        rapport_validated,
        soutenance_validated,
        student:profiles!pfe_projects_student_id_fkey(id, full_name),
        topic:pfe_topics(title),
        documents(category, uploaded_by, pfe_project_id)
      `)
      .eq('supervisor_id', userId)

    if (projects && projects.length > 0) {
      const scored = projects.map((p: any) => {
        const student = Array.isArray(p.student) ? p.student[0] : p.student
        const topic = Array.isArray(p.topic) ? p.topic[0] : p.topic
        const docs: any[] = p.documents || []

        const docsUploaded = DOC_STRUCTURE.filter((title) =>
          docs.some((d) => d.category === title && d.uploaded_by === student?.id)
        ).length

        const validationScore =
          (p.app_validated ? 1 : 0) +
          (p.rapport_validated ? 1 : 0) +
          (p.soutenance_validated ? 1 : 0)

        return {
          id: student?.id ?? p.id,
          full_name: student?.full_name ?? null,
          docsUploaded,
          docsTotal: TOTAL_DOCS,
          appValidated: p.app_validated ?? false,
          rapportValidated: p.rapport_validated ?? false,
          soutenanceValidated: p.soutenance_validated ?? false,
          topicTitle: topic?.title ?? null,
          score: docsUploaded * 10 + validationScore * 30,
        }
      })

      scored.sort((a: any, b: any) => b.score - a.score)
      const best = scored[0]
      topStudent = {
        id: best.id,
        full_name: best.full_name,
        docsUploaded: best.docsUploaded,
        docsTotal: best.docsTotal,
        appValidated: best.appValidated,
        rapportValidated: best.rapportValidated,
        soutenanceValidated: best.soutenanceValidated,
        topicTitle: best.topicTitle,
      }
    }

    return NextResponse.json({
      topicsProposed: topicsCount || 0,
      studentsSupervised: studentsCount || 0,
      pendingApplications: applicationsCount || 0,
      topStudent,
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
