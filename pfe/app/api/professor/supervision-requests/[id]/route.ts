import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { id } = await params
    const body = await request.json()
    const { status } = body
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide (accepted ou rejected)' }, { status: 400 })
    }

    const supabase = await createClient()
    const professorId = auth.user!.id

    const { data: req, error: fetchError } = await supabase
      .from('supervision_requests')
      .select('id, student_id, status')
      .eq('id', id)
      .eq('professor_id', professorId)
      .single()

    if (fetchError || !req) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }
    if (req.status !== 'pending') {
      return NextResponse.json({ error: 'Cette demande a déjà été traitée' }, { status: 400 })
    }

    if (status === 'accepted') {
      // Check student doesn't already have a PFE
      const { data: existingPfe } = await supabase
        .from('pfe_projects')
        .select('id')
        .eq('student_id', req.student_id)
        .maybeSingle()
      if (existingPfe) {
        await supabase
          .from('supervision_requests')
          .update({ status: 'rejected', updated_at: new Date().toISOString() })
          .eq('id', id)
        return NextResponse.json({ error: "L'étudiant a déjà un encadrant" }, { status: 400 })
      }

      const startDate = new Date().toISOString().split('T')[0]
      const { error: insertError } = await supabase
        .from('pfe_projects')
        .insert({
          student_id: req.student_id,
          supervisor_id: professorId,
          topic_id: null,
          status: 'approved',
          start_date: startDate,
        })
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from('supervision_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    return NextResponse.json({ request: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
