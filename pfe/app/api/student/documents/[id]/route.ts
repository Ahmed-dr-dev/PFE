import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { readFile, unlink } from 'fs/promises'
import { join } from 'path'

function mimeFromName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain; charset=utf-8',
    csv: 'text/csv; charset=utf-8',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    zip: 'application/zip',
  }
  return map[ext] || 'application/octet-stream'
}

function contentDispositionAttachment(fileName: string): string {
  const safe = fileName.replace(/[\r\n"]/g, '_').slice(0, 200) || 'document'
  return `attachment; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
}

/** Téléchargement sécurisé (fichiers locaux pfe/Pfe-doc/) pour l’étudiant : son projet ou document public de son encadrant. */
export async function GET(
  _request: Request,
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

    const { data: pfe } = await supabase
      .from('pfe_projects')
      .select('id, supervisor_id')
      .eq('student_id', userId)
      .maybeSingle()

    if (!pfe?.id) {
      return NextResponse.json({ error: 'Aucun projet PFE' }, { status: 403 })
    }

    const { data: document, error } = await supabase
      .from('documents')
      .select('id, name, file_path, file_type, uploaded_by, pfe_project_id')
      .eq('id', id)
      .maybeSingle()

    if (error || !document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    if (document.pfe_project_id) {
      if (document.pfe_project_id !== pfe.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
      }
    } else {
      if (!pfe.supervisor_id || document.uploaded_by !== pfe.supervisor_id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
      }
    }

    const rel = document.file_path as string
    if (!rel || !rel.startsWith('pfe/Pfe-doc/')) {
      return NextResponse.json({ error: 'Fichier non disponible' }, { status: 404 })
    }

    const absPath = join(process.cwd(), rel)
    let buffer: Buffer
    try {
      buffer = await readFile(absPath)
    } catch {
      return NextResponse.json({ error: 'Fichier introuvable sur le serveur' }, { status: 404 })
    }

    const displayName = (document.name as string) || 'document'
    const mime =
      document.file_type && String(document.file_type).includes('/')
        ? String(document.file_type)
        : mimeFromName(displayName)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Disposition': contentDispositionAttachment(displayName),
        'Cache-Control': 'private, no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

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
