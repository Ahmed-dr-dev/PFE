import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Inscription désactivée. Contactez l\'administration pour obtenir un compte.' },
    { status: 403 }
  )
}
