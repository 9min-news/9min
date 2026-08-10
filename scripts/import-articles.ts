/**
 * Import Twitter Articles → MDX files in content/medienkritik/
 *
 * Usage:
 *   npx tsx scripts/import-articles.ts              # import new only
 *   npx tsx scripts/import-articles.ts --update-bodies  # also re-inject links into existing bodies
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const TWITTER_DIR = path.join(
  process.cwd(),
  'twitter-2026-08-08-f56336be03af9dd9c8ca11295303003a760688bf24b8426f8a87f900e60de479',
  'data'
)
const OUT_DIR = path.join(process.cwd(), 'content', 'medienkritik')
const UPDATE_BODIES = process.argv.includes('--update-bodies')

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StyleRange {
  fromIndex: string
  toIndex: string
  style: { name: string }
}

interface EntityRange {
  fromIndex: string
  toIndex: string
  entity: {
    key: string
    type: { name: string }
    data: { url?: string }
  }
}

interface Block {
  text: string
  type: { name: string }
  inlineStyleRanges: StyleRange[]
  entityRanges: EntityRange[]
  index: string
}

interface ArticleData {
  article: {
    id: string
    title: string
    coverMedia: string | null
    content: { blocks: Block[] }
    media: unknown[]
  }
}

interface ArticleMetadata {
  articleMetadata: {
    firstPublishedAtMs: string
    createdAtMs: string
    tweetId: string
    lifecycleState: {
      lifecycle: { name: string }
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseJsExport(filePath: string): unknown[] {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const json = raw.replace(/^window\.YTD\.[^=]+=\s*/, '').trim()
  return JSON.parse(json) as unknown[]
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

interface Annotation {
  from: number
  to: number
  open: string
  close: string
}

function applyAnnotations(text: string, annotations: Annotation[]): string {
  if (!annotations.length) return text

  // Apply from right to left to keep indices valid
  const sorted = [...annotations].sort((a, b) => b.from - a.from || b.to - a.to)
  let result = text

  for (const { from, to, open, close } of sorted) {
    if (from >= to || from < 0 || to > result.length) continue
    const inner = result.slice(from, to)
    result = result.slice(0, from) + open + inner + close + result.slice(to)
  }

  return result
}

function blockToMarkdown(block: Block): string {
  const text = block.text ?? ''
  const annotations: Annotation[] = []

  for (const { fromIndex, toIndex, style } of block.inlineStyleRanges ?? []) {
    const marker = style.name === 'Bold' ? '**' : style.name === 'Italic' ? '*' : null
    if (!marker) continue
    annotations.push({ from: parseInt(fromIndex), to: parseInt(toIndex), open: marker, close: marker })
  }

  for (const { fromIndex, toIndex, entity } of block.entityRanges ?? []) {
    if (entity?.type?.name === 'Url' && entity.data?.url) {
      annotations.push({
        from: parseInt(fromIndex),
        to: parseInt(toIndex),
        open: '[',
        close: `](${entity.data.url})`,
      })
    }
  }

  return applyAnnotations(text, annotations)
}

function blocksToMarkdown(blocks: Block[]): string {
  const sorted = [...blocks].sort((a, b) => parseInt(a.index) - parseInt(b.index))
  const parts: string[] = []

  for (const block of sorted) {
    // Divider atomic block
    if (block.type?.name === 'Atomic') {
      const isDivider = (block.entityRanges ?? []).some(er => er.entity?.type?.name === 'Divider')
      if (isDivider) {
        parts.push('---')
        continue
      }
    }

    if (!block.text?.trim() && block.type?.name !== 'Paragraph') continue
    const text = blockToMarkdown(block)

    if (block.type?.name === 'HeaderTwo') {
      parts.push(`## ${text}`)
    } else {
      if (text.trim()) parts.push(text)
    }
  }

  return parts.join('\n\n')
}

function excerpt(content: string, max = 155): string {
  const plain = content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
  if (plain.length <= max) return plain
  return plain.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

function formatDate(ms: string): string {
  return new Date(parseInt(ms)).toISOString().slice(0, 10)
}

function yaml(value: string): string {
  if (/[:#\[\]{}&*!|>'"%@`,]/.test(value) || value.includes('\n')) {
    return `"${value.replace(/"/g, '\\"')}"`
  }
  return value
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const articles = parseJsExport(path.join(TWITTER_DIR, 'article.js')) as ArticleData[]
const metadata = parseJsExport(path.join(TWITTER_DIR, 'article-metadata.js')) as ArticleMetadata[]

// Build tweetId → {body} map for body updates
const tweetBodyMap = new Map<string, string>()

let imported = 0
let bodyUpdated = 0
let skipped = 0
let dupes = 0

for (let i = 0; i < articles.length; i++) {
  const article = articles[i].article
  const meta = metadata[i]?.articleMetadata

  if (!meta || meta.lifecycleState?.lifecycle?.name !== 'Published') {
    skipped++
    continue
  }

  const title = article.title?.trim() ?? 'Untitled'
  const slug = slugify(title)
  const outPath = path.join(OUT_DIR, `${slug}.md`)
  const body = blocksToMarkdown(article.content?.blocks ?? [])
  const tweetId = meta.tweetId

  tweetBodyMap.set(tweetId, body)

  if (fs.existsSync(outPath)) {
    dupes++
    continue
  }

  const date = formatDate(meta.firstPublishedAtMs)
  const desc = excerpt(body)
  const cover = article.coverMedia ?? ''

  const frontmatter = [
    '---',
    `title: ${yaml(title)}`,
    `date: "${date}"`,
    `status: published`,
    `type: medienkritik`,
    cover ? `coverImage: "${cover}"` : null,
    `tweetId: "${tweetId}"`,
    `categories: []`,
    `tags: []`,
    `seo:`,
    `  description: ${yaml(desc)}`,
    '---',
  ].filter(Boolean).join('\n')

  fs.writeFileSync(outPath, `${frontmatter}\n\n${body}\n`)
  imported++
}

console.log(`✓ Imported: ${imported}`)
console.log(`  Skipped (not published): ${skipped}`)
console.log(`  Skipped (already exist): ${dupes}`)

// ---------------------------------------------------------------------------
// Body update pass — re-inject links into existing articles
// ---------------------------------------------------------------------------

if (UPDATE_BODIES) {
  console.log('\nUpdating bodies with source links…')

  const allFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.md'))

  for (const file of allFiles) {
    const filePath = path.join(OUT_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)

    const tweetId = String(data.tweetId ?? '')
    if (!tweetId || !tweetBodyMap.has(tweetId)) continue

    const newBody = tweetBodyMap.get(tweetId)!
    // Only write if body actually changed
    if (content.trim() === newBody.trim()) continue

    const updated = matter.stringify('\n' + newBody + '\n', data)
    fs.writeFileSync(filePath, updated)
    bodyUpdated++
    console.log(`  ✓ ${file}`)
  }

  console.log(`\nBody updates: ${bodyUpdated}`)
}
