import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { verifyAdminSession } from '@/lib/mediawatch/adminAuth'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Admin mediawatch protection
  const isAdminPage = pathname.startsWith('/admin/mediawatch')
  const isAdminApi = pathname.startsWith('/api/mediawatch')
  if (isAdminPage || isAdminApi) {
    // Login page and auth endpoint are exempt
    const isLoginPage = pathname === '/admin/mediawatch/login'
    const isAuthEndpoint = pathname === '/api/mediawatch/auth'
    if (!isLoginPage && !isAuthEndpoint) {
      const adminToken = request.cookies.get('mw_admin')?.value
      const valid = adminToken ? await verifyAdminSession(adminToken) : false
      if (!valid) {
        if (isAdminApi) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.redirect(new URL('/admin/mediawatch/login', request.url))
      }
    }
  }

  // Existing session handling
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
