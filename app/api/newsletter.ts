import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const data = await request.json()
  // Aquí iría la integración con Mailchimp
  console.log('Newsletter signup', data)
  return NextResponse.json({ ok: true })
}
