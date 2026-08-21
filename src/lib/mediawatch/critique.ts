import promptText from './prompts/mediawatch-v3.md'

export function loadSystemPrompt(): string {
  return promptText
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

export function buildUserMessage(input: CritiqueInput): string {
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
