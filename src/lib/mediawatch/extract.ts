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
    // Retry with slightly different headers
    res = await fetch(url, {
      headers: { ...headers, Referer: 'https://www.google.com/' },
      redirect: 'follow',
    })
  }
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
  return res.text()
}

export async function extractUrl(url: string): Promise<ExtractionResult> {
  const html = await fetchHtml(url)

  // Run defuddle with linkedom for proper server-side DOM
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { parseHTML } = require('linkedom') as { parseHTML: (html: string) => { document: Document } }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Defuddle = require('defuddle') as new (doc: Document, opts?: { url?: string }) => { parse(): { content: string; title: string; description: string; site: string; published: string } }

  const { document } = parseHTML(html)
  const defuddled = new Defuddle(document, { url }).parse()

  // Use cheerio on the raw HTML for captions + related (defuddle strips these)
  const $ = cheerio.load(html)

  const title =
    defuddled.title?.trim() ||
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().trim() ||
    ''

  const siteName =
    defuddled.site ||
    $('meta[property="og:site_name"]').attr('content') ||
    new URL(url).hostname.replace(/^www\./, '')

  const publishedTime =
    defuddled.published ||
    $('meta[property="article:published_time"]').attr('content') ||
    $('time[datetime]').first().attr('datetime') ||
    ''

  // Captions from figcaptions (before defuddle strips them)
  const captions: string[] = []
  $('figcaption').each((_, el) => {
    const text = $(el).text().trim()
    if (text) captions.push(text)
  })

  // Related articles
  const related: Array<{ text: string; url?: string }> = []
  const relatedSelectors = [
    '.related-articles a',
    '.mehr-zum-thema a',
    '[data-testid="related"] a',
    'aside a',
    '.teaser-ng a',
    '.teaser a',
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

  // Convert defuddle's cleaned HTML to markdown
  const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' })
  td.remove(['script', 'style', 'noscript'])
  const markdown = td.turndown(defuddled.content || '')

  if (!markdown.trim()) {
    throw new Error('Kein Inhalt extrahiert — bitte URL prüfen oder Text manuell einfügen.')
  }

  return { title, markdown, captions, related, siteName, publishedTime }
}
