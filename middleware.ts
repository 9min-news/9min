import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('9min_session')?.value
  const response = NextResponse.next()

  if (token) {
    const email = await verifySession(token)
    if (email) {
      response.headers.set('x-user-email', email)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
