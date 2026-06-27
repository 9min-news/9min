import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim() : ''

  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  try {
    const res = await fetch(
      'https://buttondown.com/api/emails/embed-subscribe/9min',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email }),
        redirect: 'manual',
      }
    )

    if (res.ok || res.status === 302) {
      const response = NextResponse.json({ ok: true })
      response.cookies.set('9min_sub', '1', {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        sameSite: 'lax',
      })
      return response
    }
  } catch {
    // network error — fall through
  }

  return NextResponse.json({ ok: false, error: 'subscribe_failed' }, { status: 500 })
}
