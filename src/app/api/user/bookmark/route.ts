import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { getSubscriber, setMetadata, emptyMeta } from '@/lib/buttondown'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('9min_session')?.value
  if (!token) return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })

  const email = await verifySession(token)
  if (!email) return NextResponse.json({ ok: false, error: 'invalid_session' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const slug = typeof body?.slug === 'string' ? body.slug : null
  if (!slug) return NextResponse.json({ ok: false, error: 'missing_slug' }, { status: 400 })

  const subscriber = await getSubscriber(email)
  if (!subscriber) return NextResponse.json({ ok: false, error: 'subscriber_not_found' }, { status: 404 })

  const meta = { ...emptyMeta(), ...subscriber.metadata }
  const isBookmarked = meta.bookmarks.includes(slug)

  if (isBookmarked) {
    meta.bookmarks = meta.bookmarks.filter(s => s !== slug)
  } else {
    meta.bookmarks = [slug, ...meta.bookmarks]
  }

  await setMetadata(subscriber.id, meta)
  return NextResponse.json({ ok: true, bookmarked: !isBookmarked, bookmarks: meta.bookmarks })
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('9min_session')?.value
  if (!token) return NextResponse.json({ bookmarks: [] })

  const email = await verifySession(token)
  if (!email) return NextResponse.json({ bookmarks: [] })

  const subscriber = await getSubscriber(email)
  const bookmarks = subscriber?.metadata?.bookmarks ?? []
  return NextResponse.json({ bookmarks })
}
