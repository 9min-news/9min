import { NextRequest, NextResponse } from 'next/server'
import { exchangeCode } from '@/lib/mediawatch/xauth'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const storedVerifier = req.cookies.get('mw_xauth_verifier')?.value
  const storedState = req.cookies.get('mw_xauth_state')?.value

  if (!code || !storedVerifier || state !== storedState) {
    return NextResponse.json({ error: 'Ungültige OAuth-Anfrage' }, { status: 400 })
  }

  try {
    const redirectUri = `${req.nextUrl.origin}/api/mediawatch/xauth/callback`
    const { accessToken, refreshToken } = await exchangeCode(code, storedVerifier, redirectUri)

    const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>X verbunden</title>
<style>body{font-family:monospace;padding:2rem;background:#FAFAF7;color:#1A2E1A}
code{background:#eee;padding:4px 8px;border-radius:4px;word-break:break-all;display:block;margin:8px 0}
h1{font-size:1.2rem;margin-bottom:1.5rem}</style></head>
<body>
<h1>X erfolgreich verbunden — Token kopieren und in Vercel-Env-Variablen einfügen:</h1>
<p><strong>X_ACCESS_TOKEN</strong></p>
<code>${accessToken}</code>
${refreshToken ? `<p><strong>X_REFRESH_TOKEN</strong></p><code>${refreshToken}</code>` : ''}
<p style="margin-top:2rem;font-size:0.85rem;color:#666">Diese Seite enthält sensible Tokens. Schliesse sie nach dem Kopieren.</p>
<p><a href="/admin/mediawatch">← Zurück zu Media Watch</a></p>
</body></html>`

    const res = new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
    res.cookies.delete('mw_xauth_verifier')
    res.cookies.delete('mw_xauth_state')
    return res
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fehler'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
