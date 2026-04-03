import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const PERIOD_KEYS = ['defense_period_start', 'defense_period_end'] as const

export async function GET() {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const supabase = await createClient()

    const { data: settingsRows } = await supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', [...PERIOD_KEYS])

    const settingsMap = Object.fromEntries((settingsRows || []).map((r) => [r.key, r.value || '']))

    const { data: blockedDefs } = await supabase
      .from('defenses')
      .select('pfe_project_id')
      .neq('status', 'cancelled')

    const blocked = new Set((blockedDefs || []).map((d) => d.pfe_project_id).filter(Boolean))

    const { data: projects, error: projErr } = await supabase
      .from('pfe_projects')
      .select(`
        id,
        status,
        supervisor_id,
        supervisor_defense_ready,
        student:profiles!pfe_projects_student_id_fkey(id, full_name, email, department, year),
        topic:pfe_topics(id, title),
        supervisor:profiles!pfe_projects_supervisor_id_fkey(id, full_name, email, department)
      `)
      .eq('supervisor_defense_ready', true)
      .in('status', ['approved', 'in_progress'])
      .not('supervisor_id', 'is', null)

    if (projErr) {
      if (projErr.message?.includes('supervisor_defense_ready') || projErr.code === '42703') {
        return NextResponse.json(
          {
            error:
              'Colonne supervisor_defense_ready manquante. Exécutez la migration defenses-scheduling-supervisor-ready.sql.',
          },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: projErr.message }, { status: 500 })
    }

    const eligible = (projects || [])
      .filter((p: { id: string }) => !blocked.has(p.id))
      .map((p: any) => {
        const student = Array.isArray(p.student) ? p.student[0] : p.student
        const topic = Array.isArray(p.topic) ? p.topic[0] : p.topic
        const supervisor = Array.isArray(p.supervisor) ? p.supervisor[0] : p.supervisor
        return {
          id: p.id,
          status: p.status,
          student: student || null,
          topic: topic || null,
          supervisor: supervisor || null,
        }
      })

    const { data: profs, error: profErr } = await supabase
      .from('profiles')
      .select('id, full_name, email, department')
      .eq('role', 'professor')
      .order('full_name', { ascending: true })

    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 })

    return NextResponse.json({
      defensePeriodStart: settingsMap.defense_period_start || null,
      defensePeriodEnd: settingsMap.defense_period_end || null,
      eligibleProjects: eligible,
      professors: profs || [],
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
