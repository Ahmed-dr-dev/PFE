import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  return userId || null
}

export async function getCurrentUser() {
  const userId = await getUserId()
  if (!userId) return null

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return profile
}

export async function requireAuth(requiredRole?: 'student' | 'professor' | 'admin') {
  const userId = await getUserId()
  if (!userId) {
    return { error: 'Non authentifié', status: 401, user: null }
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { error: 'Profil non trouvé', status: 404, user: null }
  }

  if (requiredRole && profile.role !== requiredRole) {
    return { error: 'Accès non autorisé', status: 403, user: null }
  }

  return { error: null, status: 200, user: profile }
}
