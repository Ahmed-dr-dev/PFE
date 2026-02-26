import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const studentId = auth.user!.id
    const supabase = await createClient()

    const { data: pfe } = await supabase
      .from('pfe_projects')
      .select('supervisor_id')
      .eq('student_id', studentId)
      .eq('status', 'approved')
      .maybeSingle()

    if (!pfe?.supervisor_id) {
      return NextResponse.json(
        { error: 'Vous devez avoir un encadrant assigné pour proposer un sujet' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, description, requirements, department } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Titre et description requis' },
        { status: 400 }
      )
    }

    const { data: topic, error } = await supabase
      .from('pfe_topics')
      .insert({
        title,
        description,
        requirements: requirements || null,
        department: department || null,
        professor_id: pfe.supervisor_id,
        status: 'pending', // Professor will approve
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ topic })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
