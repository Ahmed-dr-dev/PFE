import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('supervision_capacity')
      .eq('id', userId)
      .single()

    const capacity = profile?.supervision_capacity ?? 8

    const { data: projects } = await supabase
      .from('pfe_projects')
      .select(`
        id,
        student:profiles!pfe_projects_student_id_fkey(id)
      `)
      .eq('supervisor_id', userId)

    const current = (projects || []).filter((p: any) => {
      const student = Array.isArray(p.student) ? p.student[0] : p.student
      return !!student?.id
    }).length

    return NextResponse.json({ current, capacity, available: Math.max(0, capacity - current) })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

