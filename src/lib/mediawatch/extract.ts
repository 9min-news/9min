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
      'X-Target-Selector': 'article, main, [class*="article-body"], [class*="article-content"]',
    }
    const jinaKey = process.env.JINA_API_KEY
    if (jinaKey) headers['Authorization'] = `Bearer ${jinaKey}`

    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers,
      signal: AbortSignal.timeout(12000),
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

  // Always run defuddle on the raw HTML (SRF and other SSR sites have full content in static HTML)
  const defuddleExtracted = html ? await extractWithDefuddle(html, url) : null

  // Pick whichever gives more content — Jina can truncate on free tier
  let extracted: { title: string; markdown: string } | null
  if (jinaExtracted && defuddleExtracted) {
    extracted = jinaExtracted.markdown.length >= defuddleExtracted.markdown.length
      ? jinaExtracted
      : defuddleExtracted
  } else {
    extracted = jinaExtracted ?? defuddleExtracted
  }

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
