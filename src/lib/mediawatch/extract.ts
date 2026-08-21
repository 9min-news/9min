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
  let res = await fetch(url, { headers: { 'User-Agent': CHROME_UA }, redirect: 'follow' })
  if (res.status === 403) {
    res = await fetch(url, {
      headers: {
        'User-Agent': CHROME_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-CH,de;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    })
  }
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
  return res.text()
}

export async function extractUrl(url: string): Promise<ExtractionResult> {
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)

  // Remove noise elements before extraction
  $('script, style, nav, header, footer, noscript, .ad, .advertisement, .cookie-banner').remove()

  // Meta fields
  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text() ||
    ''

  const siteName =
    $('meta[property="og:site_name"]').attr('content') ||
    new URL(url).hostname.replace(/^www\./, '')

  const publishedTime =
    $('meta[property="article:published_time"]').attr('content') ||
    $('meta[name="date"]').attr('content') ||
    $('time[datetime]').first().attr('datetime') ||
    ''

  // Collect figcaptions before stripping them
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
    '.teaser a',
  ]
  const seen = new Set<string>()
  for (const sel of relatedSelectors) {
    $(sel).each((_, el) => {
      const text = $(el).text().trim()
      const href = $(el).attr('href')
      if (text && !seen.has(text)) {
        seen.add(text)
        related.push({ text, url: href ? new URL(href, url).href : undefined })
      }
    })
    if (related.length >= 10) break
  }

  // Pick the best content element
  const candidates = [
    'article',
    'main',
    '[role="main"]',
    '.article-body',
    '.article-content',
    '.content-article',
    '.entry-content',
    '.post-content',
    '.content',
  ]
  let bodyHtml = ''
  for (const sel of candidates) {
    const el = $(sel).first()
    if (el.length) { bodyHtml = el.html() ?? ''; break }
  }
  if (!bodyHtml) bodyHtml = $('body').html() ?? ''

  // HTML → Markdown
  const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' })
  td.remove(['script', 'style', 'nav', 'header', 'footer', 'noscript', 'aside', 'figure'])
  const markdown = td.turndown(bodyHtml)

  return { title: title.trim(), markdown, captions, related, siteName, publishedTime }
}
