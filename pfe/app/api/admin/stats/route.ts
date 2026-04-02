import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const CHUNK = 120

function chunkIds<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function fetchStudentIdsFiltered(
  supabase: Awaited<ReturnType<typeof createClient>>,
  department: string,
  year: string
): Promise<string[]> {
  const ids: string[] = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    let q = supabase.from('profiles').select('id').eq('role', 'student').order('id')
    if (department) q = q.eq('department', department)
    if (year) q = q.eq('year', year)
    const { data, error } = await q.range(from, from + pageSize - 1)
    if (error) throw error
    if (!data?.length) break
    ids.push(...data.map((r: { id: string }) => r.id))
    if (data.length < pageSize) break
  }
  return ids
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireAuth('admin')
    if (auth.error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', auth.user!.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')?.trim() || ''
    const year = searchParams.get('year')?.trim() || ''
    const hasStudentFilters = !!(department || year)

    let totalStudents = 0
    let studentsWithSupervisor = 0
    let studentsWithoutSupervisor = 0
    let pfeInProgressCount = 0
    let pfeCompletedCount = 0
    let studentIdSet = new Set<string>()

    if (hasStudentFilters) {
      const studentIds = await fetchStudentIdsFiltered(supabase, department, year)
      studentIdSet = new Set(studentIds)
      totalStudents = studentIds.length

      const supervisedInFilter = new Set<string>()
      for (const part of chunkIds(studentIds, CHUNK)) {
        if (!part.length) continue
        const { data: rows } = await supabase
          .from('pfe_projects')
          .select('student_id')
          .in('student_id', part)
          .not('supervisor_id', 'is', null)
        rows?.forEach((r: { student_id: string }) => supervisedInFilter.add(r.student_id))
      }
      studentsWithSupervisor = supervisedInFilter.size
      studentsWithoutSupervisor = Math.max(0, totalStudents - studentsWithSupervisor)

      const projectsInFilter: { status: string; student_id: string }[] = []
      for (const part of chunkIds(studentIds, CHUNK)) {
        if (!part.length) continue
        const { data: rows } = await supabase
          .from('pfe_projects')
          .select('status, student_id')
          .in('student_id', part)
        if (rows?.length) projectsInFilter.push(...(rows as { status: string; student_id: string }[]))
      }
      const studentHasInProgress = new Set(
        projectsInFilter.filter((p) => p.status === 'in_progress').map((p) => p.student_id)
      )
      const studentHasCompleted = new Set(
        projectsInFilter.filter((p) => p.status === 'completed').map((p) => p.student_id)
      )
      pfeInProgressCount = studentHasInProgress.size
      pfeCompletedCount = studentHasCompleted.size
    } else {
      const { count: ts } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
      totalStudents = ts || 0

      const { data: supervisedRows } = await supabase
        .from('pfe_projects')
        .select('student_id')
        .not('supervisor_id', 'is', null)
      const supervisedSet = new Set((supervisedRows || []).map((r: { student_id: string }) => r.student_id))
      studentsWithSupervisor = supervisedSet.size
      studentsWithoutSupervisor = Math.max(0, totalStudents - studentsWithSupervisor)

      const { data: statusRows } = await supabase.from('pfe_projects').select('status, student_id')
      const inProg = new Set(
        (statusRows || []).filter((r: { status: string }) => r.status === 'in_progress').map((r: { student_id: string }) => r.student_id)
      )
      const compl = new Set(
        (statusRows || []).filter((r: { status: string }) => r.status === 'completed').map((r: { student_id: string }) => r.student_id)
      )
      pfeInProgressCount = inProg.size
      pfeCompletedCount = compl.size
    }

    let profQuery = supabase
      .from('profiles')
      .select('id, full_name, email, department, office, supervision_capacity')
      .eq('role', 'professor')
      .order('full_name')
    if (department) profQuery = profQuery.eq('department', department)

    const { data: professors, error: profErr } = await profQuery
    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 })
    }

    const profList = professors || []
    const profIds = profList.map((p: { id: string }) => p.id)
    const totalProfessors = profList.length

    const supervisionByProf = new Map<string, number>()
    for (const part of chunkIds(profIds, CHUNK)) {
      if (!part.length) continue
      const { data: rows } = await supabase
        .from('pfe_projects')
        .select('supervisor_id')
        .in('supervisor_id', part)
        .not('supervisor_id', 'is', null)
      rows?.forEach((r: { supervisor_id: string }) => {
        const sid = r.supervisor_id
        supervisionByProf.set(sid, (supervisionByProf.get(sid) || 0) + 1)
      })
    }

    let totalCapacity = 0
    let supervisionSlotsUsed = 0
    let professorsSupervising = 0
    let professorsAtCapacity = 0
    let professorsWithoutStudent = 0
    for (const p of profList) {
      const cap = typeof p.supervision_capacity === 'number' ? p.supervision_capacity : 8
      totalCapacity += cap
      const used = supervisionByProf.get(p.id) || 0
      supervisionSlotsUsed += used
      if (used > 0) professorsSupervising += 1
      else professorsWithoutStudent += 1
      if (used >= cap && cap > 0) professorsAtCapacity += 1
    }
    const avgStudentsPerSupervisor =
      professorsSupervising > 0 ? Math.round((supervisionSlotsUsed / professorsSupervising) * 10) / 10 : 0
    const capacityUtilizationPercent =
      totalCapacity > 0 ? Math.round((supervisionSlotsUsed / totalCapacity) * 1000) / 10 : 0

    let topicsPendingQ = supabase
      .from('pfe_topics')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    if (department) topicsPendingQ = topicsPendingQ.eq('department', department)
    const { count: pendingTopics } = await topicsPendingQ

    let topicsApprovedQ = supabase
      .from('pfe_topics')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
    if (department) topicsApprovedQ = topicsApprovedQ.eq('department', department)
    const { count: approvedTopics } = await topicsApprovedQ

    const { count: pendingAssignments } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    let pendingAssignmentsFiltered = pendingAssignments || 0
    const { data: pendAssignRows, error: assignErr } = await supabase
      .from('assignments')
      .select('student_id')
      .eq('status', 'pending')
    if (!assignErr && pendAssignRows) {
      if (hasStudentFilters) {
        pendingAssignmentsFiltered = pendAssignRows.filter(
          (r: { student_id: string | null }) => r.student_id && studentIdSet.has(r.student_id)
        ).length
      } else {
        pendingAssignmentsFiltered = pendAssignRows.length
      }
    }

    const { data: deptRows } = await supabase
      .from('profiles')
      .select('department')
      .eq('role', 'student')
      .not('department', 'is', null)
    const departmentOptions = [
      ...new Set(
        (deptRows || [])
          .map((r: { department: string | null }) => r.department)
          .filter(Boolean) as string[]
      ),
    ].sort()

    const { data: yearRows } = await supabase
      .from('profiles')
      .select('year')
      .eq('role', 'student')
      .not('year', 'is', null)
    const yearOptions = [
      ...new Set(
        (yearRows || []).map((r: { year: string | null }) => r.year).filter(Boolean) as string[]
      ),
    ].sort()

    const { data: studentPreview } = await supabase
      .from('profiles')
      .select(
        `
        id,
        full_name,
        email,
        department,
        year,
        pfe:pfe_projects!pfe_projects_student_id_fkey(
          id,
          supervisor_id,
          supervisor:profiles!pfe_projects_supervisor_id_fkey(full_name)
        )
      `
      )
      .eq('role', 'student')
      .order('full_name', { ascending: true })
      .limit(48)

    const studentsPreview =
      studentPreview
        ?.map((s: any) => {
          const pfe = Array.isArray(s.pfe) ? s.pfe[0] : s.pfe
          const sup = pfe && (Array.isArray(pfe.supervisor) ? pfe.supervisor[0] : pfe.supervisor)
          const hasSupervisor = !!(pfe?.supervisor_id && sup)
          return {
            id: s.id,
            full_name: s.full_name,
            email: s.email,
            department: s.department,
            year: s.year,
            hasSupervisor,
            supervisorName: hasSupervisor ? sup?.full_name || '—' : null,
          }
        })
        .filter((row) => {
          if (department && row.department !== department) return false
          if (year && row.year !== year) return false
          return true
        })
        .slice(0, 10) || []

    const professorsPreview = profList.slice(0, 10).map((p: any) => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      department: p.department,
      office: p.office,
      capacity: typeof p.supervision_capacity === 'number' ? p.supervision_capacity : 8,
      studentsSupervised: supervisionByProf.get(p.id) || 0,
    }))

    const topicsProposedByFilteredProfs =
      profIds.length > 0
        ? (
            await Promise.all(
              chunkIds(profIds, CHUNK).map(async (part) => {
                if (!part.length) return 0
                const { count } = await supabase
                  .from('pfe_topics')
                  .select('*', { count: 'exact', head: true })
                  .in('professor_id', part)
                return count || 0
              })
            )
          ).reduce((a, b) => a + b, 0)
        : 0

    return NextResponse.json({
      filters: { department: department || null, year: year || null },
      filterOptions: {
        departments: departmentOptions,
        years: yearOptions,
      },

      totalStudents,
      studentsWithSupervisor,
      studentsWithoutSupervisor,
      pfeInProgressCount,
      pfeCompletedCount,

      totalProfessors,
      professorsSupervising,
      professorsWithoutStudent,
      totalSupervisionSlots: totalCapacity,
      supervisionSlotsUsed,
      professorsAtCapacity,
      avgStudentsPerSupervisor,
      capacityUtilizationPercent,
      topicsProposedByFilteredProfs,

      pendingTopics: pendingTopics || 0,
      approvedTopics: approvedTopics || 0,
      pendingAssignments: pendingAssignments || 0,
      pendingAssignmentsFiltered,

      activePFE: studentsWithSupervisor,
      inactivePFE: studentsWithoutSupervisor,

      studentsPreview,
      professorsPreview,
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
