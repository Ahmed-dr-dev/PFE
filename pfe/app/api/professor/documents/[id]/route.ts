import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const userId = auth.user!.id
    const supabase = await createClient()

    const { status } = await request.json()

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    // Get document
    const { data: document } = await supabase
      .from('documents')
      .select(`
        id,
        pfe_project_id,
        uploaded_by,
        pfe_projects(
          supervisor_id
        )
      `)
      .eq('id', id)
      .single()

    if (!document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    // Check authorization:
    // - Can update own public documents
    // - Can update student-submitted documents if supervisor
    const isOwnPublicDoc = document.pfe_project_id === null && document.uploaded_by === userId
    const project = Array.isArray(document.pfe_projects) ? document.pfe_projects[0] : document.pfe_projects
    const isStudentDoc = document.pfe_project_id !== null && project?.supervisor_id === userId

    if (!isOwnPublicDoc && !isStudentDoc) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Update document status
    const { data: updatedDoc, error } = await supabase
      .from('documents')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
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
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ document: updatedDoc })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('professor')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const userId = auth.user!.id
    const supabase = await createClient()

    // Get document
    const { data: document } = await supabase
      .from('documents')
      .select(`
        file_path,
        uploaded_by,
        pfe_project_id,
        pfe_projects(
          supervisor_id
        )
      `)
      .eq('id', id)
      .single()

    if (!document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    // Check authorization:
    // - Can delete own public documents
    // - Can delete student-submitted documents if supervisor
    const isOwnPublicDoc = document.pfe_project_id === null && document.uploaded_by === userId
    const project = Array.isArray(document.pfe_projects) ? document.pfe_projects[0] : document.pfe_projects
    const isStudentDoc = document.pfe_project_id !== null && project?.supervisor_id === userId

    if (!isOwnPublicDoc && !isStudentDoc) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Delete local file
    if (document.file_path && document.file_path.startsWith('pfe/Pfe-doc/')) {
      const filePath = join(process.cwd(), document.file_path)
      try {
        await unlink(filePath)
      } catch (error) {
        console.error('Error deleting local file:', error)
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
