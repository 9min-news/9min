import { NextRequest, NextResponse } from 'next/server'
import { signAdminSession } from '@/lib/mediawatch/adminAuth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Ungültiges Passwort' }, { status: 401 })
  }
  const token = await signAdminSession()
  const res = NextResponse.json({ ok: true })
  res.cookies.set('mw_admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('mw_admin')
  return res
}
