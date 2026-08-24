// Supabase Edge Function — Venice AI critique generation (60s timeout vs Vercel's 30s)
// Deploy: supabase functions deploy critique --no-verify-jwt
// Secrets needed: VENICE_INFERENCE_KEY, GITHUB_TOKEN, GITHUB_REPO, CRITIQUE_SECRET

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ── GitHub helpers (inline from src/lib/mediawatch/github.ts) ────────────────

function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function decodeBase64(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ''))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function githubHeaders() {
  const token = Deno.env.get('GITHUB_TOKEN')
  if (!token) throw new Error('GITHUB_TOKEN not set')
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

function repoName() {
  const r = Deno.env.get('GITHUB_REPO')
  if (!r) throw new Error('GITHUB_REPO not set')
  return r
}

async function ghGet(path: string): Promise<{ sha: string; content: string } | null> {
  const res = await fetch(`https://api.github.com/repos/${repoName()}/contents/${path}`, {
    headers: githubHeaders(),
    cache: 'no-store',
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status}`)
  const data = await res.json()
  return { sha: data.sha, content: decodeBase64(data.content) }
}

async function ghPut(path: string, content: string, message: string, sha?: string): Promise<void> {
  const body: Record<string, string> = { message, content: encodeBase64(content) }
  if (sha) body.sha = sha
  const res = await fetch(`https://api.github.com/repos/${repoName()}/contents/${path}`, {
    method: 'PUT',
    headers: githubHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub PUT ${path}: ${res.status} ${err}`)
  }
}

// ── Draft helpers (inline from src/lib/mediawatch/draft.ts) ─────────────────

interface Draft {
  id: string
  sourceUrl: string
  quelle: string
  originalTitle: string
  title: string
  markdown: string
  status: string
  createdAt: string
  updatedAt: string
  publishedUrl?: string
  captions: string[]
  related: Array<{ text: string; url?: string }>
}

function draftPath(id: string) {
  return `data/mediawatch/drafts/${id}.json`
}

function newId() {
  return `mw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

async function createDraft(fields: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>): Promise<Draft> {
  const now = new Date().toISOString()
  const draft: Draft = { id: newId(), createdAt: now, updatedAt: now, ...fields }
  await ghPut(draftPath(draft.id), JSON.stringify(draft, null, 2), `mediawatch: create draft ${draft.id} [skip ci]`)
  return draft
}

async function getDraft(id: string): Promise<Draft | null> {
  const file = await ghGet(draftPath(id))
  if (!file) return null
  return JSON.parse(file.content) as Draft
}

async function updateDraft(id: string, patch: Partial<Draft>): Promise<Draft> {
  const file = await ghGet(draftPath(id))
  if (!file) throw new Error(`Draft ${id} not found`)
  const current = JSON.parse(file.content) as Draft
  const updated: Draft = { ...current, ...patch, id, updatedAt: new Date().toISOString() }
  await ghPut(draftPath(id), JSON.stringify(updated, null, 2), `mediawatch: update draft ${id} [skip ci]`, file.sha)
  return updated
}

// ── System prompt (inline from src/lib/mediawatch/prompts/mediawatch-v3-text.ts) ──

const SYSTEM_PROMPT = `Du bist Medienkritiker für 9min.ch. Du schreibst chirurgische Kritiken zu Nachrichtenbeiträgen — primär SRF, aber auch andere Medien. Deine Kritik zeigt die Lücke zwischen dem, was ein Medium berichtet, und dem, was es weglässt. Du bist kein Aktivist. Du bist ein Registrator.

## WAHRHEITSREGELN (absolut)

1. Keine erfundenen Zitate, Zahlen, Studien, Experten oder Ereignisse. Alles, was du dem kritisierten Beitrag zuschreibst, muss wörtlich oder sinngemäss darin stehen.
2. Kontext, den du von aussen einbringst (Gesetze, Statistiken, Vorgeschichte, konkrete Projekte), muss allgemein verifizierbar sein. Bist du unsicher, markiere die Stelle mit [VERIFIZIEREN] statt sie zu behaupten.
3. Unterscheide strikt zwischen zwei Kritikformen:
   — WEGLASSUNG: Der Beitrag verschweigt einen Fakt, der das Bild verändert.
   — UNTERLASSUNG: Der Beitrag nennt einen Fakt, verfolgt ihn aber nicht weiter.
   Eine Weglassung ist ein Vorwurf. Eine Unterlassung ist eine verpasste Chance. Behandle sie unterschiedlich.

## AUFBAU

TITEL: Ein prägnanter Titel, der das Framing oder den Mechanismus bereits benennt — kein Wiedergabetitel. Zwei bewährte Formen: das Urteil («Die verspätete und falsche Einordnung des SRF») oder die zugespitzte Frage («Fake News, oder Indoktrination?»). Der Titel verspricht nichts, was der Text nicht hält.

LEAD: Eröffne mit der Framing-Diagnose in 2–4 Sätzen. Welches Etikett, welcher Vergleich, welche Vorannahme strukturiert den Beitrag? Zeige es an einer konkreten Stelle (Titel, erste Frage, Bildlegende, Wortwahl). Danach die Quellzeile: «Zum [Medium]-Beitrag «[Originaltitel]», [Sendung/Rubrik], [Datum]».

ANERKENNUNG: Ein Absatz, der ehrlich benennt, was der Beitrag korrekt macht: Fakten, Unterscheidungen, Stimmen. Keine Höflichkeitsfloskel — ein analytisches Instrument. Wer präzise lobt, kritisiert glaubwürdig. Wenn der Beitrag nichts gut macht, sage das in einem Satz und begründe es.

KONFRONTATION: Zwei bis vier Abschnitte mit Zwischentiteln. Jeder Abschnitt behandelt einen Treffer — nicht mehr, nicht weniger. Prüfe jeden: Verändert diese Weglassung das Bild wirklich? Wenn nein, streiche ihn. Mit der verfügbaren Länge kannst du pro Abschnitt tiefer graben: einen Fakt entfalten, eine Rechnung aufmachen, ein Zitat gegen ein Zitat stellen. Tiefe schlägt Breite.

KATEGORIE: Ein Abschnitt, der den Mechanismus explizit benennt — in Sätzen, die über den Einzelfall hinausgehen. Nicht: «SRF fragt nicht X.» Sondern: «Das Muster ist: [allgemeiner Satz, von dem dieser Fall ein Spezialfall ist].» Beispiele für solche Kategorien: das übernommene Dementi (Behörde dementiert, Medium übernimmt, Wirkung existiert trotzdem); die asymmetrische Skepsis (Misstrauen nach unten, Vertrauen nach oben); die Kulturerklärung als Systementlastung; die Verteilungsfrage als Schätzfrage. Erfinde bei Bedarf eine neue Kategorie — aber benenne sie.

SCHLUSS: Eine Verdichtung des Mechanismus in wenigen Sätzen. Formbewährung: «So funktioniert dieser Beitrag: Er meldet X und rahmt es als Y.» Danach der letzte Satz — eine Feststellung, keine Frage, keine Forderung, keine Empörung. Er verdichtet die Auslassung, nicht die Empörung.

## ZWISCHENTITEL

Zwischentitel sind Mini-Urteile, nicht Etiketten. Sie benennen, was der Beitrag mit seinem Stoff tut oder nicht tut. Bewährtes Muster: «Die 80 Prozent, die niemand einordnet», «Der Experte, der als Entlastung dient», «Die Rückkehr, die als schwierig abgetan wird». Aber: Nicht jeder Zwischentitel darf derselben Formel folgen. Variiere — ein Urteil, ein Zitat-Splitter, eine schlichte Feststellung. Drei gleiche Muster hintereinander sind die Grenze.

## STILISTISCHE DNA (zwingend)

- Hochdeutsch mit Schweizer Orthographie (ss statt ß).
- Länge: bis maximal 1337 Wörter. Kürzer ist besser, wenn der Inhalt es erlaubt — aber die Länge ist Raum für Tiefe, nicht für Anhäufung.
- Durchgehende Prosa innerhalb der Abschnitte. Keine Bullet Points, keine Tabellen, keine Aufzählungen.
- Ton: kalt, registrierend, nie polemisch. Fakten sprechen für sich. Keine Empörung, keine Adjektive der Wut, keine rhetorischen Fragen, deren Antwort der Leser schon kennt.
- Parallele Satzstrukturen sind erlaubt als Instrument: «Das Medium berichtet X. Dass Y der Fall ist, bleibt unerwähnt.» ABER: Maximal drei Durchgänge derselben Formel im gesamten Text. Ab dem vierten wird das Instrument zur Manier. Zähle mit.
- Verbotene Formeln mit Quote: «fragt nicht», «erwähnt nicht», «verschweigt», «bleibt unerörtert» — jede davon maximal zweimal im Text.
- Bildlegenden, verlinkte Artikel und «Mehr zum Thema»-Listen sind Teil des Beitrags. Prüfe sie systematisch — oft steht der zentrale Befund in der Legende, das Framing in der Verlinkung.
- Keine Meta-Kommentare über dich selbst, den Auftrag oder den Schreibprozess.

## SELBSTPRÜFUNG VOR AUSGABE

Prüfe still, bevor du ausgibst:
1. Steht jedes zugeschriebene Zitat wirklich im Beitrag?
2. Ist die Kategorie benannt — in Sätzen, die man auf andere Fälle anwenden könnte?
3. Habe ich eine Wiederholungsformel mehr als dreimal verwendet? Wenn ja: umschreiben.
4. Folgen mehr als drei Zwischentitel demselben Muster? Wenn ja: variieren.
5. Ist die Anerkennung ehrlich oder nur pro forma?
6. Ist der Schlusssatz eine Verdichtung — oder nur eine Wiederholung?
7. Wortzahl unter 1337?
Gib nur Titel und Text aus, ohne diese Prüfung zu erwähnen.`

function buildUserMessage(input: {
  markdown: string
  quelle: string
  originalTitle: string
  publishedTime: string
  captions: string[]
  related: Array<{ text: string; url?: string }>
  kontext?: string
  schwerpunkt?: string
}): string {
  const captionsBlock = input.captions.length > 0 ? input.captions.join('\n') : '—'
  const relatedBlock =
    input.related.length > 0
      ? input.related.map((r) => (r.url ? `${r.text} (${r.url})` : r.text)).join('\n')
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

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  // Auth
  const secret = Deno.env.get('CRITIQUE_SECRET')
  const auth = req.headers.get('Authorization')
  if (secret && auth !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401, headers: CORS })
  }

  const apiKey = Deno.env.get('VENICE_INFERENCE_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'VENICE_INFERENCE_KEY not set' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

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
  } = body as {
    draftId?: string
    markdown?: string
    quelle?: string
    originalTitle?: string
    publishedTime?: string
    captions?: string[]
    related?: Array<{ text: string; url?: string }>
    kontext?: string
    schwerpunkt?: string
  }

  if (!markdown || !quelle || !originalTitle) {
    return new Response(
      JSON.stringify({ error: 'markdown, quelle und originalTitle sind erforderlich' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }

  const truncatedMarkdown = (markdown as string).length > 5000
    ? (markdown as string).slice(0, 5000) + '\n\n[…]'
    : (markdown as string)

  const userMessage = buildUserMessage({
    markdown: truncatedMarkdown,
    quelle: quelle as string,
    originalTitle: originalTitle as string,
    publishedTime: (publishedTime as string) ?? '',
    captions: captions as string[],
    related: related as Array<{ text: string; url?: string }>,
    kontext: kontext as string | undefined,
    schwerpunkt: schwerpunkt as string | undefined,
  })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))

      try {
        const veniceRes = await fetch('https://api.venice.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(55000),
          body: JSON.stringify({
            model: 'z-ai-glm-5-3',
            max_tokens: 1100,
            temperature: 0.6,
            stream: true,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
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

        if (!fullMarkdown.trim()) {
          send({ error: 'Venice returned no content — check VENICE_INFERENCE_KEY and model name z-ai-glm-5-3' })
          controller.close()
          return
        }

        // Extract title from first heading
        let title = originalTitle as string
        const firstLine = fullMarkdown.split('\n')[0].replace(/^#{1,3}\s*/, '').trim()
        if (firstLine) title = firstLine

        // Save draft to GitHub
        let draft: Draft
        if (draftId) {
          const existing = await getDraft(draftId as string)
          if (existing) {
            draft = await updateDraft(draftId as string, {
              markdown: fullMarkdown,
              title,
              status: 'draft',
              captions: captions as string[],
              related: related as Array<{ text: string; url?: string }>,
            })
          } else {
            draft = await createDraft({
              sourceUrl: (body.sourceUrl as string) ?? '',
              quelle: quelle as string,
              originalTitle: originalTitle as string,
              title,
              markdown: fullMarkdown,
              status: 'draft',
              captions: captions as string[],
              related: related as Array<{ text: string; url?: string }>,
            })
          }
        } else {
          draft = await createDraft({
            sourceUrl: (body.sourceUrl as string) ?? '',
            quelle: quelle as string,
            originalTitle: originalTitle as string,
            title,
            markdown: fullMarkdown,
            status: 'draft',
            captions: captions as string[],
            related: related as Array<{ text: string; url?: string }>,
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
      ...CORS,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
})
