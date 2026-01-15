import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear user_id cookie
  response.cookies.delete('user_id')

  return response
}


