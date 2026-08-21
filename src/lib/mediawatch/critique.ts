import fs from 'fs'
import path from 'path'

const PROMPT_PATH = path.join(process.cwd(), 'src/lib/mediawatch/prompts/mediawatch-v3.md')

function loadSystemPrompt(): string {
  return fs.readFileSync(PROMPT_PATH, 'utf-8')
}

export interface CritiqueInput {
  markdown: string
  quelle: string
  originalTitle: string
  publishedTime: string
  captions: string[]
  related: Array<{ text: string; url?: string }>
  kontext?: string
  schwerpunkt?: string
}

function buildUserMessage(input: CritiqueInput): string {
  const captionsBlock = input.captions.length > 0 ? input.captions.join('\n') : '—'
  const relatedBlock =
    input.related.length > 0
      ? input.related.map(r => (r.url ? `${r.text} (${r.url})` : r.text)).join('\n')
      : '—'
  const datum = input.publishedTime
    ? new Date(input.publishedTime).toLocaleDateString('de-CH')
    : '—'

  return `Schreibe eine Medienkritik zu folgendem Beitrag.

QUELLE: ${input.quelle}
TITEL: ${input.originalTitle}
DATUM: ${datum}

BEITRAG:
---
${input.markdown}

BILDBESCHRIFTUNGEN:
${captionsBlock}

VERWANDTE ARTIKEL:
${relatedBlock}
---

KONTEXT (nur verifizierte Fakten):
${input.kontext ?? '—'}

SCHWERPUNKT:
${input.schwerpunkt ?? 'freie Analyse'}`
}

export async function generateCritique(input: CritiqueInput): Promise<string> {
  const apiKey = process.env.VENICE_INFERENCE_KEY
  if (!apiKey) throw new Error('VENICE_INFERENCE_KEY not set')

  const systemPrompt = loadSystemPrompt()
  const userMessage = buildUserMessage(input)

  const res = await fetch('https://api.venice.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'z-ai-glm-5-3',
      max_tokens: 4000,
      temperature: 0.6,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Venice API error ${res.status}: ${err}`)
  }

  interface VeniceResponse {
    choices: Array<{ message: { content: string } }>
  }
  const data: VeniceResponse = await res.json()
  return data.choices[0]?.message?.content ?? ''
}
