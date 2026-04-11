import { requireAuth } from '@/lib/auth'
import { getSupabaseForAdminData } from '@/lib/supabase/admin-server'
import { NextResponse } from 'next/server'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { id } = await params
    const supabase = await getSupabaseForAdminData()

    // Ensure the professor owns this announcement
    const { data: existing } = await supabase
      .from('announcements')
      .select('id, created_by')
      .eq('id', id)
      .single()

    if (!existing || existing.created_by !== auth.user!.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
