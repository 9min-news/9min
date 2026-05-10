import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.formData()
  const email = body.get('email')?.toString().trim()

  if (!email || !email.includes('@')) {
    return NextResponse.redirect(new URL('/?fehler=email', request.url), 303)
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

    // Buttondown embed returns 200 on success or 302 redirect
    if (res.ok || res.status === 302) {
      return NextResponse.redirect(new URL('/danke', request.url), 303)
    }
  } catch {
    // network error — fall through to error redirect
  }

  return NextResponse.redirect(new URL('/?fehler=subscribe', request.url), 303)
}
