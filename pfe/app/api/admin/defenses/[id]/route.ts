import { requireAuth } from '@/lib/auth'
import { getSupabaseForAdminData } from '@/lib/supabase/admin-server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth('admin')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { id } = await params
    const body = await request.json()
    const supabase = await getSupabaseForAdminData()

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    const allowed = ['scheduled_date', 'scheduled_time', 'room', 'jury_professor_ids', 'duration_minutes', 'status', 'notes']
    allowed.forEach((k) => { if (body[k] !== undefined) updateData[k] = body[k] })

    // When jury_professor_ids change, resolve names and update jury_members too
    if (Array.isArray(body.jury_professor_ids) && body.jury_professor_ids.length > 0) {
      const ids = body.jury_professor_ids as string[]
      const { data: jurors } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', ids)

      if (jurors && jurors.length > 0) {
        const orderMap = new Map(ids.map((pid, i) => [pid, i]))
        const names = [...jurors]
          .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
          .map((j) => j.full_name || j.id)
        updateData.jury_members = names
      }
    }

    const { data, error } = await supabase
      .from('defenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ defense: data })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
