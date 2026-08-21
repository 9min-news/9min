import { NextRequest, NextResponse } from 'next/server'
import { buildAuthUrl } from '@/lib/mediawatch/xauth'

function callbackUrl(req: NextRequest) {
  const origin = req.nextUrl.origin
  return `${origin}/api/mediawatch/xauth/callback`
}

export async function GET(req: NextRequest) {
  try {
    const { url, codeVerifier, state } = buildAuthUrl(callbackUrl(req))
    const res = NextResponse.redirect(url)
    // Store PKCE values in short-lived cookies
    res.cookies.set('mw_xauth_verifier', codeVerifier, { httpOnly: true, maxAge: 600, path: '/' })
    res.cookies.set('mw_xauth_state', state, { httpOnly: true, maxAge: 600, path: '/' })
    return res
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fehler'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
