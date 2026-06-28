import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const referer = request.headers.get('referer') ?? '/'
  const redirectTo = referer.startsWith('http') ? new URL(referer).pathname : '/'

  const response = NextResponse.redirect(new URL(redirectTo, request.url))
  response.cookies.delete('9min_session')
  response.cookies.delete('9min_user')
  return response
}
