import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const auth = await requireAuth('admin')
    if (auth.error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', auth.user!.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Count pending topics
    const { count: pendingTopics } = await supabase
      .from('pfe_topics')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Count total students
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')

    // Count total professors
    const { count: totalProfessors } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'professor')

    // Count active PFE
    const { count: activePFE } = await supabase
      .from('pfe_projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress')

    // Count pending assignments
    const { count: pendingAssignments } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Count completed PFE
    const { count: completedPFE } = await supabase
      .from('pfe_projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    return NextResponse.json({
      pendingTopics: pendingTopics || 0,
      totalStudents: totalStudents || 0,
      totalProfessors: totalProfessors || 0,
      activePFE: activePFE || 0,
      pendingAssignments: pendingAssignments || 0,
      completedPFE: completedPFE || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
