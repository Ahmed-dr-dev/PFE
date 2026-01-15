import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const userId = auth.user!.id
    const supabase = await createClient()

    const { date, time, duration, type, notes, location, status } = await request.json()

    // Verify the meeting belongs to this professor
    const { data: meeting } = await supabase
      .from('meetings')
      .select('supervisor_id')
      .eq('id', id)
      .single()

    if (!meeting || meeting.supervisor_id !== userId) {
      return NextResponse.json({ error: 'Réunion non trouvée' }, { status: 404 })
    }

    // Update meeting
    const { data: updatedMeeting, error } = await supabase
      .from('meetings')
      .update({
        date: date || undefined,
        time: time || undefined,
        duration: duration || undefined,
        type: type || undefined,
        notes: notes !== undefined ? notes : undefined,
        location: location !== undefined ? location : undefined,
        status: status || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ meeting: updatedMeeting })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const userId = auth.user!.id
    const supabase = await createClient()

    // Verify the meeting belongs to this professor
    const { data: meeting } = await supabase
      .from('meetings')
      .select('supervisor_id')
      .eq('id', id)
      .single()

    if (!meeting || meeting.supervisor_id !== userId) {
      return NextResponse.json({ error: 'Réunion non trouvée' }, { status: 404 })
    }

    // Delete meeting
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
