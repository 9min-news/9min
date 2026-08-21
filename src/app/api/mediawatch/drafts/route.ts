import { NextResponse } from 'next/server'
import { listDrafts } from '@/lib/mediawatch/draft'

export async function GET() {
  try {
    const drafts = await listDrafts()
    return NextResponse.json(drafts)
  } catch (err) {
    console.error('listDrafts error:', err)
    return NextResponse.json({ error: 'Fehler beim Laden der Entwürfe' }, { status: 500 })
  }
}
