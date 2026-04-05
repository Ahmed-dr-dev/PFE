import { createClient as createSupabaseJsClient, type SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

/**
 * Server-side client with optional service role.
 * Your app uses a custom `user_id` cookie (no Supabase Auth JWT), so PostgREST often runs as `anon`
 * and RLS hides rows. Set SUPABASE_SERVICE_ROLE_KEY in `.env.local` for API routes that must see all data.
 */
export async function getSupabaseForAdminData(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && serviceKey) {
    return createSupabaseJsClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return createClient()
}
