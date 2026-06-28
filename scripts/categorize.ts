/**
 * Categorize medienkritik articles using Venice.ai API
 *
 * Usage: VENICE_API_KEY=xxx npx tsx scripts/categorize.ts
 *
 * Edit TAXONOMY below before running.
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'medienkritik')
const API_KEY = process.env.VENICE_API_KEY
const VENICE_BASE = 'https://api.venice.ai/api/v1'

// ---------------------------------------------------------------------------
// ✏️  EDIT THIS — define your category taxonomy
// ---------------------------------------------------------------------------
const TAXONOMY: string[] = [
  'SRF/SRG',
  'Billag/Gebühren',
  'Abstimmungen',
  'SNB/Geldpolitik',
  'Wirtschaft',
  'Gesellschaft',
  'Demokratie',
  'Medienrecht',
  'EU/Aussenpolitik',
  'Migration',
  'Klima',
  'Zensur/Meinungsfreiheit',
]
// ---------------------------------------------------------------------------

if (!API_KEY) {
  console.error('Missing VENICE_API_KEY env var')
  process.exit(1)
}

async function categorize(title: string, excerpt: string): Promise<string[]> {
  const resp = await fetch(`${VENICE_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b',
      messages: [
        {
          role: 'system',
          content: `You categorize Swiss media criticism articles.
Return ONLY a JSON array of 1–3 categories chosen from this list: ${JSON.stringify(TAXONOMY)}.
No explanation, no markdown, just the JSON array.`,
        },
        {
          role: 'user',
          content: `Title: ${title}\n\n${excerpt}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 60,
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Venice API error ${resp.status}: ${err}`)
  }

  const data = await resp.json() as { choices: Array<{ message: { content: string } }> }
  const raw = data.choices[0].message.content.trim()

  try {
    const parsed = JSON.parse(raw) as string[]
    return parsed.filter(c => TAXONOMY.includes(c))
  } catch {
    // Try to extract array from response if surrounded by text
    const match = raw.match(/\[.*\]/)
    if (match) return JSON.parse(match[0]) as string[]
    return []
  }
}

function getExcerpt(body: string, max = 600): string {
  return body
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, max)
}

const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))
let done = 0
let errors = 0

for (const file of files) {
  const filePath = path.join(CONTENT_DIR, file)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  // Skip if already categorized
  if (data.categories && data.categories.length > 0) {
    console.log(`  skip  ${file} (already has categories)`)
    continue
  }

  try {
    const categories = await categorize(data.title ?? '', getExcerpt(content))
    data.categories = categories

    // Reconstruct file with updated frontmatter
    const newFrontmatter = matter.stringify(content, data)
    fs.writeFileSync(filePath, newFrontmatter)

    console.log(`  ✓  ${file} → [${categories.join(', ')}]`)
    done++

    // Rate limit: 2 req/s to be safe
    await new Promise(r => setTimeout(r, 500))
  } catch (e) {
    console.error(`  ✗  ${file}: ${e}`)
    errors++
  }
}

console.log(`\nDone: ${done} categorized, ${errors} errors`)
