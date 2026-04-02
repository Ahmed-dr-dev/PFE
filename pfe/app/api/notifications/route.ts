import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function allowedRole(role: string) {
  return role === 'student' || role === 'professor'
}

export async function GET() {
  try {
    const auth = await requireAuth()
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    if (!allowedRole(auth.user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const supabase = await createClient()
    const userId = auth.user.id

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('id, type, title, body, link, read_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const unreadCount = (notifications || []).filter((n) => !n.read_at).length
    return NextResponse.json({ notifications: notifications || [], unreadCount })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuth()
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    if (!allowedRole(auth.user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { id: notificationId, markAll } = body as {
      id?: string
      markAll?: boolean
    }

    const supabase = await createClient()
    const userId = auth.user.id
    const now = new Date().toISOString()

    if (markAll) {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: now })
        .eq('user_id', userId)
        .is('read_at', null)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    if (!notificationId || typeof notificationId !== 'string') {
      return NextResponse.json({ error: 'id requis' }, { status: 400 })
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
