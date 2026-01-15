import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get student's PFE project
    const { data: pfe } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('student_id', user.id)
      .maybeSingle()

    if (!pfe) {
      return NextResponse.json({ milestones: [] })
    }

    const { data: milestones, error } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('pfe_project_id', pfe.id)
      .order('order_index', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ milestones: milestones || [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
