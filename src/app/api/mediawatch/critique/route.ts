import { NextRequest, NextResponse } from 'next/server'
import { generateCritique } from '@/lib/mediawatch/critique'
import { createDraft, updateDraft, getDraft } from '@/lib/mediawatch/draft'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    draftId,
    markdown,
    quelle,
    originalTitle,
    publishedTime,
    captions = [],
    related = [],
    kontext,
    schwerpunkt,
  } = body

  if (!markdown || !quelle || !originalTitle) {
    return NextResponse.json({ error: 'markdown, quelle und originalTitle sind erforderlich' }, { status: 400 })
  }

  try {
    const critiqueMarkdown = await generateCritique({
      markdown,
      quelle,
      originalTitle,
      publishedTime: publishedTime ?? '',
      captions,
      related,
      kontext,
      schwerpunkt,
    })

    // Extract title from first line if the model outputs "## Title\n\nBody"
    let title = originalTitle
    const firstLine = critiqueMarkdown.split('\n')[0].replace(/^#{1,3}\s*/, '').trim()
    if (firstLine) title = firstLine

    let draft
    if (draftId) {
      const existing = await getDraft(draftId)
      if (existing) {
        draft = await updateDraft(draftId, {
          markdown: critiqueMarkdown,
          title,
          status: 'draft',
          captions,
          related,
        })
      }
    }
    if (!draft) {
      draft = await createDraft({
        sourceUrl: body.sourceUrl ?? '',
        quelle,
        originalTitle,
        title,
        markdown: critiqueMarkdown,
        status: 'draft',
        captions,
        related,
      })
    }

    return NextResponse.json(draft)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
    console.error('critique error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
