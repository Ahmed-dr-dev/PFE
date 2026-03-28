import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const supabase = await createClient()

    const { data: row, error: fetchErr } = await supabase
      .from('supervision_requests')
      .select('id, status, student_id')
      .eq('id', id)
      .eq('student_id', auth.user!.id)
      .maybeSingle()

    if (fetchErr || !row) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }

    if (row.status !== 'pending') {
      return NextResponse.json(
        { error: 'Seules les demandes en attente peuvent être annulées' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('supervision_requests').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
