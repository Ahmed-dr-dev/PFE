import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get student's PFE project to find supervisor
    const { data: pfe } = await supabase
      .from('pfe_projects')
      .select('id, supervisor_id')
      .eq('student_id', user.id)
      .maybeSingle()

    if (!pfe || !pfe.supervisor_id) {
      return NextResponse.json({ supervisor: null })
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

    // Get meetings
    const { data: meetings } = await supabase
      .from('meetings')
      .select('*')
      .eq('student_id', user.id)
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    // Get shared documents
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
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
