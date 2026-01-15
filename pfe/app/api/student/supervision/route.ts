import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Get student's PFE project to find supervisor (even if pending - student should see supervisor info)
    const { data: pfe } = await supabase
      .from('pfe_projects')
      .select('id, supervisor_id, status')
      .eq('student_id', auth.user!.id)
      .maybeSingle()

    if (!pfe || !pfe.supervisor_id) {
      return NextResponse.json({ supervisor: null, pfeStatus: null, meetings: [], documents: [] })
    }

    // Get supervisor details
    const { data: supervisor, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, department, office, office_hours, bio, expertise')
      .eq('id', pfe.supervisor_id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get meetings (only if PFE project exists)
    const { data: meetings } = await supabase
      .from('meetings')
      .select('*')
      .eq('student_id', auth.user!.id)
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    // Get shared documents (only if PFE project exists)
    const { data: documents } = await supabase
      .from('documents')
      .select(`
        id,
        name,
        file_path,
        file_type,
        file_size,
        category,
        status,
        uploaded_at,
        uploaded_by,
        uploader:profiles(
          full_name
        )
      `)
      .eq('pfe_project_id', pfe.id)
      .order('uploaded_at', { ascending: false })

    return NextResponse.json({
      supervisor,
      meetings: meetings || [],
      documents: documents || [],
      pfeStatus: pfe.status,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
