import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const userId = auth.user!.id
    const supabase = await createClient()

    // Get document to verify ownership
    const { data: document } = await supabase
      .from('documents')
      .select(`
        file_path,
        uploaded_by,
        pfe_project_id,
        pfe_projects!inner(
          student_id
        )
      `)
      .eq('id', id)
      .single()

    if (!document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    // Check if user owns the document (uploaded it or it's in their project)
    const project = Array.isArray(document.pfe_projects) ? document.pfe_projects[0] : document.pfe_projects
    if (document.uploaded_by !== userId && project?.student_id !== userId) {
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
