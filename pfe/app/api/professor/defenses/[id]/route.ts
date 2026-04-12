import { requireAuth } from '@/lib/auth'
import { getSupabaseForAdminData } from '@/lib/supabase/admin-server'
import { NextResponse } from 'next/server'

// PATCH /api/professor/defenses/[id]
// Allows the Président du jury (jury_professor_ids[2]) to submit a note (0-20)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { id } = await params
    const userId = auth.user!.id
    const supabase = await getSupabaseForAdminData()

    // Fetch the defense to verify the professor is the jury president
    const { data: defense, error: fetchErr } = await supabase
      .from('defenses')
      .select('id, jury_professor_ids, status')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !defense) {
      return NextResponse.json({ error: 'Soutenance introuvable' }, { status: 404 })
    }

    const ids: string[] = defense.jury_professor_ids || []
    if (ids[2] !== userId) {
      return NextResponse.json(
        { error: 'Seul le Président du jury peut soumettre une note.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const rawNote = body.note

    if (rawNote === undefined || rawNote === null || rawNote === '') {
      return NextResponse.json({ error: 'La note est requise.' }, { status: 400 })
    }

    const note = Number(rawNote)
    if (isNaN(note) || note < 0 || note > 20) {
      return NextResponse.json({ error: 'La note doit être comprise entre 0 et 20.' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {
      note: Math.round(note * 100) / 100,
      updated_at: new Date().toISOString(),
    }
    if (typeof body.note_comment === 'string') {
      updateData.note_comment = body.note_comment.trim().slice(0, 2000) || null
    }

    const { data, error } = await supabase
      .from('defenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ defense: data })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
