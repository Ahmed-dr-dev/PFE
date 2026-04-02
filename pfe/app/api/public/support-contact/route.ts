import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const MAX_LEN = { name: 200, email: 320, subject: 200, message: 8000 }

function trim(s: unknown, max: number): string {
  if (typeof s !== 'string') return ''
  return s.trim().slice(0, max)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = trim(body.name, MAX_LEN.name)
    const email = trim(body.email, MAX_LEN.email)
    const subject = trim(body.subject, MAX_LEN.subject)
    const message = trim(body.message, MAX_LEN.message)

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nom, e-mail et message sont requis' },
        { status: 400 }
      )
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailOk) {
      return NextResponse.json({ error: 'Adresse e-mail invalide' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from('support_contact_submissions').insert({
      name,
      email,
      subject: subject || null,
      message,
    })

    if (error) {
      if (error.message?.includes('relation') || error.code === '42P01') {
        return NextResponse.json(
          { error: 'Service indisponible. Exécutez la migration SQL support_contact_submissions.' },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
