import { requireAuth } from '@/lib/auth'
import { resolveDefensePeriod } from '@/lib/defense-period'
import { getSupabaseForAdminData } from '@/lib/supabase/admin-server'
import { NextResponse } from 'next/server'

const PERIOD_KEYS = ['defense_period_start', 'defense_period_end'] as const

function isBoolTrue(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (typeof value === 'string') {
    const s = value.toLowerCase()
    return s === 'true' || s === 't' || s === '1'
  }
  return false
}

export async function GET() {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const supabase = await getSupabaseForAdminData()

    const { data: settingsRows } = await supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', [...PERIOD_KEYS])

    const settingsMap = Object.fromEntries((settingsRows || []).map((r) => [r.key, r.value || '']))
    const period = resolveDefensePeriod(settingsMap.defense_period_start, settingsMap.defense_period_end)

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
        app_validated,
        rapport_validated,
        soutenance_validated,
        student:profiles!pfe_projects_student_id_fkey(id, full_name, email, department, year),
        topic:pfe_topics(id, title),
        supervisor:profiles!pfe_projects_supervisor_id_fkey(id, full_name, email, department)
      `)
      .not('supervisor_id', 'is', null)
      .eq('app_validated', true)
      .eq('rapport_validated', true)
      .eq('soutenance_validated', true)

    if (projErr) {
      return NextResponse.json({ error: projErr.message }, { status: 500 })
    }

    const baseList = (projects || [])
      .filter((p: { status?: string }) => {
        const st = (p.status || '').toLowerCase()
        if (st === 'rejected') return false
        if (st === 'completed') return false
        return true
      })
      .filter((p: { id: string; soutenance_validated?: unknown }) => isBoolTrue(p.soutenance_validated))
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

    const eligibleProjects = baseList

    const { data: profs, error: profErr } = await supabase
      .from('profiles')
      .select('id, full_name, email, department')
      .eq('role', 'professor')
      .order('full_name', { ascending: true })

    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 })

    return NextResponse.json({
      defensePeriodStart: period.start,
      defensePeriodEnd: period.end,
      defensePeriodComplete: period.complete,
      validatedWaitingForPeriodCount: period.complete ? 0 : baseList.length,
      eligibleProjects,
      pendingDefenseStudents: baseList,
      professors: profs || [],
      usingServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
