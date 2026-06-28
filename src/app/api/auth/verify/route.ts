import { NextRequest, NextResponse } from 'next/server'
import { verifyMagicToken, signSession } from '@/lib/auth'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://9min.ch'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token') ?? ''
  const next = searchParams.get('next') ?? '/'
  const safeNext = next.startsWith('/') ? next : '/'

  if (!token) {
    return NextResponse.redirect(new URL('/?fehler=link', SITE_URL))
  }

  const email = await verifyMagicToken(token)
  if (!email) {
    return NextResponse.redirect(new URL('/?fehler=link', SITE_URL))
  }

  const jwt = await signSession(email)
  const response = NextResponse.redirect(new URL(safeNext, SITE_URL))

  response.cookies.set('9min_session', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  response.cookies.set('9min_user', email, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  response.cookies.set('9min_sub', '1', {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  })

  return response
}
