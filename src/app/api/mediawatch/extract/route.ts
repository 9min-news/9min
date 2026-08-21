import { NextRequest, NextResponse } from 'next/server'
import { extractUrl } from '@/lib/mediawatch/extract'


export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL fehlt' }, { status: 400 })
  }
  try {
    const result = await extractUrl(url)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
