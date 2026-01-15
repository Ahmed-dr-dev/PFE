import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    // Get student's PFE project
    const { data: pfe } = await supabase
      .from('pfe_projects')
      .select('id')
      .eq('student_id', userId)
      .maybeSingle()

    if (!pfe) {
      return NextResponse.json({ documents: [] })
    }

    // Get all documents for the project (including public documents from supervisor)
    const { data: projectDocs, error: projectError } = await supabase
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
        uploader:profiles!documents_uploaded_by_fkey(
          full_name,
          role
        )
      `)
      .eq('pfe_project_id', pfe.id)
      .order('uploaded_at', { ascending: false })

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 })
    }

    // Get public documents from supervisor
    const { data: supervisor } = await supabase
      .from('pfe_projects')
      .select('supervisor_id')
      .eq('id', pfe.id)
      .single()

    let publicDocs: any[] = []
    if (supervisor?.supervisor_id) {
      const { data } = await supabase
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
          uploader:profiles!documents_uploaded_by_fkey(
            full_name,
            role
          )
        `)
        .is('pfe_project_id', null)
        .eq('uploaded_by', supervisor.supervisor_id)
        .order('uploaded_at', { ascending: false })

      publicDocs = data || []
    }

    const allDocs = [...(projectDocs || []), ...publicDocs]
    allDocs.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())

    return NextResponse.json({ documents: allDocs })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()

    // Verify user exists in profiles (for foreign key constraint)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'Profil utilisateur non trouvé' }, { status: 404 })
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
      .eq('student_id', userId)
      .maybeSingle()

    if (!pfe) {
      return NextResponse.json(
        { error: 'Aucun PFE trouvé' },
        { status: 404 }
      )
    }

    const fileExt = file.name.split('.').pop() || ''
    const fileType = fileExt.toUpperCase() || 'UNKNOWN'
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    // Save file locally to pfe/Pfe-doc directory
    const uploadDir = join(process.cwd(), 'pfe', 'Pfe-doc')
    await mkdir(uploadDir, { recursive: true })
    
    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)
    
    // Store relative path in database
    const relativePath = `pfe/Pfe-doc/${fileName}`

    // Insert document record with local file path
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        pfe_project_id: pfe.id,
        name: file.name,
        file_path: relativePath,
        file_type: fileType,
        file_size: file.size,
        category,
        uploaded_by: userId,
        status: 'pending',
      })
      .select(`
        *,
        uploader:profiles!documents_uploaded_by_fkey(
          full_name,
          role
        )
      `)
      .single()

    if (docError) {
      console.error('Document insert error:', {
        message: docError.message,
        code: docError.code,
        details: docError.details,
        hint: docError.hint,
        userId
      })
      return NextResponse.json({ 
        error: docError.message,
        code: docError.code,
        details: docError.details 
      }, { status: 500 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
