import type { NextRequest } from 'next/server'
import { loadSystemPrompt, buildUserMessage } from '@/lib/mediawatch/critique'
import { createDraft, updateDraft, getDraft } from '@/lib/mediawatch/draft'

export const runtime = 'edge'

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
    return new Response(JSON.stringify({ error: 'markdown, quelle und originalTitle sind erforderlich' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const apiKey = process.env.VENICE_INFERENCE_KEY
  if (!apiKey) return new Response(JSON.stringify({ error: 'VENICE_INFERENCE_KEY nicht gesetzt' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

  const systemPrompt = loadSystemPrompt()
  const userMessage = buildUserMessage({ markdown, quelle, originalTitle, publishedTime: publishedTime ?? '', captions, related, kontext, schwerpunkt })

  // Stream Venice response → client, save draft when complete
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))

      try {
        const veniceRes = await fetch('https://api.venice.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'z-ai-glm-5-3',
            max_tokens: 4000,
            temperature: 0.6,
            stream: true,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
          }),
        })

        if (!veniceRes.ok || !veniceRes.body) {
          const err = await veniceRes.text()
          send({ error: `Venice API ${veniceRes.status}: ${err.slice(0, 200)}` })
          controller.close()
          return
        }

        // Accumulate full markdown as SSE chunks arrive
        let fullMarkdown = ''
        const reader = veniceRes.body.getReader()
        const dec = new TextDecoder()
        let buf = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += dec.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') continue
            try {
              const chunk = JSON.parse(payload)
              const delta = chunk.choices?.[0]?.delta?.content
              if (delta) {
                fullMarkdown += delta
                send({ chunk: delta })
              }
            } catch { /* ignore malformed SSE lines */ }
          }
        }

        // Extract title from first heading line
        let title = originalTitle
        const firstLine = fullMarkdown.split('\n')[0].replace(/^#{1,3}\s*/, '').trim()
        if (firstLine) title = firstLine

        // Save draft
        let draft
        if (draftId) {
          const existing = await getDraft(draftId)
          if (existing) {
            draft = await updateDraft(draftId, { markdown: fullMarkdown, title, status: 'draft', captions, related })
          }
        }
        if (!draft) {
          draft = await createDraft({
            sourceUrl: body.sourceUrl ?? '',
            quelle,
            originalTitle,
            title,
            markdown: fullMarkdown,
            status: 'draft',
            captions,
            related,
          })
        }

        send({ done: true, draft })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
        send({ error: message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
