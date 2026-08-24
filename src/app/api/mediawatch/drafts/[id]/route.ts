import { NextRequest, NextResponse } from 'next/server'
import { getDraft, updateDraft, deleteDraft } from '@/lib/mediawatch/draft'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const draft = await getDraft(id)
  if (!draft) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  return NextResponse.json(draft)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const patch = await req.json()
  // Force status to 'review' when draft content is edited
  if (!patch.status) patch.status = 'review'
  try {
    const updated = await updateDraft(id, patch)
    return NextResponse.json(updated)
  } catch (err) {
    console.error('updateDraft error:', err)
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await deleteDraft(id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('deleteDraft error:', err)
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
  }
}
