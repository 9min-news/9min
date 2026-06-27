import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { getSubscriber, setMetadata, emptyMeta } from '@/lib/buttondown'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('9min_session')?.value
  if (!token) return NextResponse.json({ ok: false })

  const email = await verifySession(token)
  if (!email) return NextResponse.json({ ok: false })

  const body = await request.json().catch(() => null)
  const slug = typeof body?.slug === 'string' ? body.slug : null
  if (!slug) return NextResponse.json({ ok: false })

  const subscriber = await getSubscriber(email)
  if (!subscriber) return NextResponse.json({ ok: false })

  const meta = { ...emptyMeta(), ...subscriber.metadata }
  const history = [slug, ...meta.readHistory.filter(s => s !== slug)]
  meta.readHistory = history.slice(0, 200)

  await setMetadata(subscriber.id, meta)
  return NextResponse.json({ ok: true })
}
