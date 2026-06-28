import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { loadMetadata } from './metadata'

const MUSTER_DIR = path.join(process.cwd(), 'content', 'muster')

export interface Muster {
  id: string
  title: string
  subtitle: string
  kategorie: string
  schwere_tendenz: number
  date: string
  content: string
  slug: string
  beispielCount: number
}

function parseMuster(filePath: string, slug: string): Muster {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  return {
    id: String(data.id ?? ''),
    title: String(data.title ?? ''),
    subtitle: String(data.subtitle ?? ''),
    kategorie: String(data.kategorie ?? ''),
    schwere_tendenz: typeof data.schwere_tendenz === 'number' ? data.schwere_tendenz : 2,
    date: String(data.date ?? ''),
    content,
    slug,
    beispielCount: 0,
  }
}

export function getAllMuster(): Muster[] {
  if (!fs.existsSync(MUSTER_DIR)) return []

  const metadata = loadMetadata()

  const files = fs.readdirSync(MUSTER_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()

  return files
    .map(f => {
      const slug = f.replace(/\.md$/, '')
      const m = parseMuster(path.join(MUSTER_DIR, f), slug)
      m.beispielCount = metadata.filter(e => e.muster_id === m.id).length
      return m
    })
    .sort((a, b) => b.schwere_tendenz - a.schwere_tendenz || b.beispielCount - a.beispielCount)
}

export function getMusterBySlug(slug: string): Muster | undefined {
  if (!fs.existsSync(MUSTER_DIR)) return undefined

  const filePath = path.join(MUSTER_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return undefined

  const metadata = loadMetadata()
  const m = parseMuster(filePath, slug)
  m.beispielCount = metadata.filter(e => e.muster_id === m.id).length
  return m
}
