import type { SupabaseClient } from '@supabase/supabase-js'

/** Fire-and-forget: never throws to callers */
export async function createNotification(
  supabase: SupabaseClient,
  params: {
    recipientId: string
    type: string
    title: string
    body?: string | null
    link?: string | null
  }
): Promise<void> {
  try {
    const { error } = await supabase.rpc('insert_notification', {
      p_user_id: params.recipientId,
      p_type: params.type,
      p_title: params.title,
      p_body: params.body ?? null,
      p_link: params.link ?? null,
    })
    if (error) console.error('createNotification:', error.message)
  } catch (e) {
    console.error('createNotification:', e)
  }
}
