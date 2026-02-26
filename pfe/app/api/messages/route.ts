import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const withId = searchParams.get('with')

  const supabase = await createClient()

  if (withId) {
    const otherId = withId
    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, content, created_at, read_at')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('receiver_id', userId)
      .eq('sender_id', otherId)
      .is('read_at', null)
    return NextResponse.json({ messages: messages || [] })
  }

  const { data: allMessages, error } = await supabase
    .from('messages')
    .select('id, sender_id, receiver_id, content, created_at, read_at')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const peers = new Map<string, { last_at: string; last_content: string; unread: number }>()
  for (const m of allMessages || []) {
    const peerId = m.sender_id === userId ? m.receiver_id : m.sender_id
    if (!peers.has(peerId)) {
      peers.set(peerId, {
        last_at: m.created_at,
        last_content: m.content,
        unread: m.receiver_id === userId && !m.read_at ? 1 : 0,
      })
    } else {
      const p = peers.get(peerId)!
      if (m.receiver_id === userId && !m.read_at) p.unread += 1
    }
  }

  const peerIds = Array.from(peers.keys())
  if (peerIds.length === 0) {
    return NextResponse.json({ conversations: [] })
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .in('id', peerIds)

  const conversations = (profiles || []).map((p) => {
    const meta = peers.get(p.id)!
    return {
      peer: p,
      last_message: { content: meta.last_content, created_at: meta.last_at },
      unread_count: meta.unread,
    }
  })
  conversations.sort((a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime())

  return NextResponse.json({ conversations })
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
  const body = await request.json()
  const { receiver_id, content } = body
  if (!receiver_id || !content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'Destinataire et message requis' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: msg, error } = await supabase
    .from('messages')
    .insert({
      sender_id: userId,
      receiver_id: receiver_id,
      content: content.trim().slice(0, 10000),
    })
    .select('id, sender_id, receiver_id, content, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json({ message: msg })
}
