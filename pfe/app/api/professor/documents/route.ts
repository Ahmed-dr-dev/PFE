import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all' // all, public, student-submitted

    // Get all projects supervised by this professor
    const { data: projects } = await supabase
      .from('pfe_projects')
      .select('id, student_id')
      .eq('supervisor_id', userId)

    const projectIds = projects?.map(p => p.id) || []
    const studentIds = projects?.map(p => p.student_id) || []

    if (filter === 'public') {
      // Only public documents uploaded by professor
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
          uploader:profiles!documents_uploaded_by_fkey(
            full_name,
            role
          )
        `)
        .is('pfe_project_id', null)
        .eq('uploaded_by', userId)
        .order('uploaded_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ documents: documents || [] })
    } else if (filter === 'student-submitted') {
      // Documents submitted by students
      if (projectIds.length === 0) {
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
          pfe_project_id,
          uploader:profiles!documents_uploaded_by_fkey(
            full_name,
            role
          ),
          project:pfe_projects(
            student:profiles!pfe_projects_student_id_fkey(
              full_name
            )
          )
        `)
        .in('pfe_project_id', projectIds)
        .in('uploaded_by', studentIds)
        .order('uploaded_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ documents: documents || [] })
    } else {
      // All: public documents + student-submitted documents
      const { data: publicDocs } = await supabase
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
        .eq('uploaded_by', userId)
        .order('uploaded_at', { ascending: false })

      let studentDocs: any[] = []
      if (projectIds.length > 0) {
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
            ),
            project:pfe_projects(
              student:profiles!pfe_projects_student_id_fkey(
                full_name
              )
            )
          `)
          .in('pfe_project_id', projectIds)
          .in('uploaded_by', studentIds)
          .order('uploaded_at', { ascending: false })

        studentDocs = data || []
      }

      const allDocs = [...(publicDocs || []), ...studentDocs]
      allDocs.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())

      return NextResponse.json({ documents: allDocs })
    }
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

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
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

    // Create document record (always public - NULL pfe_project_id)
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        pfe_project_id: null, // Always public for all students
        name: file.name,
        file_path: relativePath,
        file_type: fileType,
        file_size: file.size,
        category,
        uploaded_by: userId,
        status: 'approved',
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
