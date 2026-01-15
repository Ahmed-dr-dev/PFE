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
      return NextResponse.json({ documents: [] })
    }

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
        uploader:profiles(
          full_name
        )
      `)
      .eq('pfe_project_id', pfe.id)
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'Autre'

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
    }

    // Get student's PFE project
    const { data: pfe } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('student_id', user.id)
      .maybeSingle()

    if (!pfe) {
      return NextResponse.json(
        { error: 'Aucun PFE trouvé' },
        { status: 404 }
      )
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
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

    // Determine file type from extension
    const fileType = fileExt?.toUpperCase() || 'UNKNOWN'

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        pfe_project_id: pfe.id,
        name: file.name,
        file_path: publicUrl,
        file_type: fileType,
        file_size: file.size,
        category,
        uploaded_by: user.id,
        status: 'pending',
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
