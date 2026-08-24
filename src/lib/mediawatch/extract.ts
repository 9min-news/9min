import TurndownService from 'turndown'
import * as cheerio from 'cheerio'

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

export interface ExtractionResult {
  title: string
  markdown: string
  captions: string[]
  related: Array<{ text: string; url?: string }>
  siteName: string
  publishedTime: string
}

async function fetchHtml(url: string): Promise<string> {
  const headers = {
    'User-Agent': CHROME_UA,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
  }
  let res = await fetch(url, { headers, redirect: 'follow' })
  if (res.status === 403 || res.status === 429) {
    res = await fetch(url, {
      headers: { ...headers, Referer: 'https://www.google.com/' },
      redirect: 'follow',
    })
  }
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
  return res.text()
}

// Jina Reader handles JS-rendered pages and returns clean markdown
async function extractWithJina(url: string): Promise<{ title: string; markdown: string } | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-With-Images-Summary': 'false',
    }
    const jinaKey = process.env.JINA_API_KEY
    if (jinaKey) headers['Authorization'] = `Bearer ${jinaKey}`

    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers,
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) return null
    const data = await res.json() as { data?: { title?: string; content?: string } }
    const markdown = data?.data?.content ?? ''
    const title = data?.data?.title ?? ''
    if (markdown.trim().length < 200) return null
    return { title, markdown }
  } catch {
    return null
  }
}

// Extract article content from Next.js __NEXT_DATA__ JSON (embedded in SSR pages like SRF)
// SRF uses Apollo GraphQL — state is a flat dict keyed "TypeName:id" with content fields
function extractFromNextData(html: string): { title: string; markdown: string } | null {
  try {
    const $ = cheerio.load(html)
    const raw = $('#__NEXT_DATA__').text()
    if (!raw) return null

    const data = JSON.parse(raw)
    const pageProps = data?.props?.pageProps
    if (!pageProps) return null

    const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' })
    td.remove(['script', 'style', 'noscript'])

    const chunks: string[] = []
    const seen = new Set<string>()

    function addText(s: string) {
      const clean = s.includes('<') ? td.turndown(s).trim() : s.trim()
      if (clean.length > 40 && !seen.has(clean)) { seen.add(clean); chunks.push(clean) }
    }

    // Strategy 1: Apollo GraphQL flat cache (SRF pattern)
    // Keys look like "Article:abc123", "Teaser:xyz", "Block:123" etc.
    const CONTENT_FIELDS = ['body', 'text', 'content', 'lead', 'description', 'summary',
      'html', 'richText', 'longText', 'intro', 'abstract', 'copy', 'freetext']

    function extractFromApolloCache(obj: Record<string, unknown>) {
      for (const [, value] of Object.entries(obj)) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) continue
        const entry = value as Record<string, unknown>
        for (const field of CONTENT_FIELDS) {
          if (typeof entry[field] === 'string') addText(entry[field] as string)
        }
      }
    }

    // Look for Apollo state under common keys
    for (const key of ['apolloState', 'initialApolloState', '__APOLLO_STATE__', 'apollo']) {
      const apolloState = (pageProps as Record<string, unknown>)[key]
      if (apolloState && typeof apolloState === 'object' && !Array.isArray(apolloState)) {
        extractFromApolloCache(apolloState as Record<string, unknown>)
      }
    }

    // Strategy 2: Generic deep walk for non-Apollo Next.js sites
    if (chunks.length === 0) {
      const NON_CONTENT_KEYS = new Set([
        '__typename', 'id', 'url', 'href', 'src', 'alt', 'type', 'name', 'rel',
        'target', 'className', 'style', 'query', 'buildId', 'locale', 'locales',
        'defaultLocale', 'isPreview', 'isFallback', 'gip', 'gsp', 'gssp',
        'scriptLoader', 'runtimeConfig', 'nextExport', 'autoExport', 'initialI18nStore',
      ])

      function walk(node: unknown, depth = 0): void {
        if (depth > 12 || node == null) return
        if (typeof node === 'string') { addText(node); return }
        if (Array.isArray(node)) { for (const item of node) walk(item, depth + 1); return }
        if (typeof node === 'object') {
          for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
            if (!NON_CONTENT_KEYS.has(k)) walk(v, depth + 1)
          }
        }
      }
      walk(pageProps)
    }

    const markdown = chunks.join('\n\n')
    if (markdown.length < 300) return null

    const title = typeof (pageProps as Record<string, unknown>)?.title === 'string'
      ? (pageProps as Record<string, unknown>).title as string
      : ''

    return { title, markdown }
  } catch {
    return null
  }
}

// Defuddle fallback for when Jina is unavailable
async function extractWithDefuddle(html: string, url: string): Promise<{ title: string; markdown: string } | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { parseHTML } = require('linkedom') as { parseHTML: (html: string) => { document: Document } }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Defuddle = require('defuddle') as new (doc: Document, opts?: { url?: string }) => { parse(): { content: string; title: string; site: string; published: string } }
    const { document } = parseHTML(html)
    const defuddled = new Defuddle(document, { url }).parse()
    const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' })
    td.remove(['script', 'style', 'noscript'])
    const markdown = td.turndown(defuddled.content || '')
    if (!markdown.trim()) return null
    return { title: defuddled.title ?? '', markdown }
  } catch {
    return null
  }
}

export async function extractUrl(url: string): Promise<ExtractionResult> {
  // Fetch HTML and run Jina in parallel
  const [htmlResult, jinaResult] = await Promise.allSettled([
    fetchHtml(url),
    extractWithJina(url),
  ])

  const html = htmlResult.status === 'fulfilled' ? htmlResult.value : ''
  const jinaExtracted = jinaResult.status === 'fulfilled' ? jinaResult.value : null

  // Run defuddle and __NEXT_DATA__ extraction on raw HTML
  const [defuddleExtracted, nextDataExtracted] = await Promise.all([
    html ? extractWithDefuddle(html, url) : Promise.resolve(null),
    html ? Promise.resolve(extractFromNextData(html)) : Promise.resolve(null),
  ])

  // Pick whichever method gave the most content
  const candidates = [jinaExtracted, defuddleExtracted, nextDataExtracted]
    .filter((c): c is { title: string; markdown: string } => !!c?.markdown.trim())
  const extracted = candidates.reduce<{ title: string; markdown: string } | null>(
    (best, c) => (!best || c.markdown.length > best.markdown.length ? c : best),
    null
  )

  if (!extracted?.markdown.trim()) {
    throw new Error('Kein Inhalt extrahiert — bitte URL prüfen oder Text manuell einfügen.')
  }

  // Use cheerio on raw HTML for metadata, captions, related
  const $ = cheerio.load(html)

  const title =
    extracted.title ||
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().trim() ||
    ''

  const siteName =
    $('meta[property="og:site_name"]').attr('content') ||
    new URL(url).hostname.replace(/^www\./, '')

  const publishedTime =
    $('meta[property="article:published_time"]').attr('content') ||
    $('time[datetime]').first().attr('datetime') ||
    ''

  const captions: string[] = []
  $('figcaption').each((_, el) => {
    const text = $(el).text().trim()
    if (text) captions.push(text)
  })

  const related: Array<{ text: string; url?: string }> = []
  const relatedSelectors = [
    '.related-articles a', '.mehr-zum-thema a', '[data-testid="related"] a',
    'aside a', '.teaser-ng a', '.teaser a',
  ]
  const seen = new Set<string>()
  for (const sel of relatedSelectors) {
    $(sel).each((_, el) => {
      const text = $(el).text().trim()
      const href = $(el).attr('href')
      if (text && text.length > 10 && !seen.has(text)) {
        seen.add(text)
        try {
          related.push({ text, url: href ? new URL(href, url).href : undefined })
        } catch {
          related.push({ text })
        }
      }
    })
    if (related.length >= 10) break
  }

  return { title, markdown: extracted.markdown, captions, related, siteName, publishedTime }
}
