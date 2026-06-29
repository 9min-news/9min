import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('9min_session')?.value

  if (token) {
    const email = await verifySession(token)
    if (email) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-email', email)
      return NextResponse.next({ request: { headers: requestHeaders } })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
