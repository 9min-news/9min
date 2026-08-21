import { NextRequest, NextResponse } from 'next/server'
import { getDraft, updateDraft } from '@/lib/mediawatch/draft'
import { publishWeb, publishX } from '@/lib/mediawatch/publish'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { web, x, xText } = await req.json()

  const draft = await getDraft(id)
  if (!draft) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  if (draft.status !== 'review') {
    return NextResponse.json({ error: 'Entwurf muss den Status "review" haben' }, { status: 400 })
  }

  let publishedUrl: string | undefined
  let xPostId: string | undefined

  if (web) {
    publishedUrl = await publishWeb(draft)
  }

  if (x && xText) {
    xPostId = await publishX(xText)
  }

  const updated = await updateDraft(id, {
    status: 'published',
    publishedUrl,
    xPostId,
  })

  return NextResponse.json(updated)
}
