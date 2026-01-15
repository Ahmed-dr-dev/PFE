import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get document to verify ownership
    const { data: document } = await supabase
      .from('documents')
      .select('file_path, pfe_project_id, pfe_projects!inner(student_id)')
      .eq('id', params.id)
      .single()

    if (!document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    // Check if user owns the document
    if (document.pfe_projects[0]?.student_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Delete from storage
    const filePath = document.file_path.replace(/^.*\/pfe-documents\//, '')
    await supabase.storage
      .from('pfe-documents')
      .remove([filePath])

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', params.id)

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
