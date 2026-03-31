import { requireAuth } from '@/lib/auth'
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
        status,
        created_at,
        updated_at,
        professor:profiles!supervision_requests_professor_id_fkey(id, full_name, email, department)
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
      return {
        ...r,
        professor,
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
    if (!professorId) {
      return NextResponse.json({ error: 'Encadrant requis' }, { status: 400 })
    }

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
            message: message || null,
            updated_at: now,
          })
          .eq('id', existingReq.id)
          .select()
          .single()
        if (reopenErr) {
          return NextResponse.json({ error: reopenErr.message }, { status: 500 })
        }
        return NextResponse.json({ request: reopened })
      }
    }

    const { data: req, error } = await supabase
      .from('supervision_requests')
      .insert({
        student_id: studentId,
        professor_id: professorId,
        message: message || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Demande déjà envoyée à cet encadrant' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ request: req })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
