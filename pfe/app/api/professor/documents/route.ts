import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    // Get all projects supervised by this professor
    const { data: projects } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('supervisor_id', userId)

    const projectIds = projects?.map(p => p.id) || []

    if (projectIds.length === 0) {
      return NextResponse.json({ documents: [] })
    }

    // Get documents for all supervised projects
    const { data: documents, error } = await supabase
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
        pfe_project_id,
        uploader:profiles(
          full_name
        ),
        project:pfe_projects(
          student:profiles!pfe_projects_student_id_fkey(
            full_name
          )
        )
      `)
      .in('pfe_project_id', projectIds)
      .order('uploaded_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ documents: documents || [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'Autre'
    const projectId = formData.get('projectId') as string

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'ID du projet requis' }, { status: 400 })
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from('pfe_projects')
      .select('id, supervisor_id')
      .eq('id', projectId)
      .single()

    if (!project || project.supervisor_id !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    const filePath = `pfe-documents/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('pfe-documents')
      .upload(filePath, file)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data } = supabase.storage
      .from('pfe-documents')
      .getPublicUrl(filePath)
    
    const publicUrl = data.publicUrl

    // Determine file type
    const fileType = fileExt?.toUpperCase() || 'UNKNOWN'

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        pfe_project_id: projectId,
        name: file.name,
        file_path: publicUrl,
        file_type: fileType,
        file_size: file.size,
        category,
        uploaded_by: userId,
        status: 'approved',
      })
      .select()
      .single()

    if (docError) {
      return NextResponse.json({ error: docError.message }, { status: 500 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
