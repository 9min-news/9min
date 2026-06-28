import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export type AudioMeta = {
  file: string
  duration: number
  size: number
  recorded: string
}

export interface ArticleFrontmatter {
  title: string
  subtitle?: string
  lead?: string
  date: string
  updated?: string
  status: 'draft' | 'published'
  type: 'chronik' | 'analyse' | 'grundlage' | 'medienkritik'
  tags?: string[]
  themen?: string[]
  categories?: string[]
  outlet?: string
  readingTime?: number
  coverImage?: string
  tweetId?: string
  seriesIndex?: number
  series?: string
  related?: string[]
  audio?: AudioMeta
  seo?: { description?: string; canonical?: string }
  image?: { og?: string; alt?: string }
  // Enrichment fields (written by scripts/enrich.ts)
  kritisiertes_medium?: string
  kritisierter_beitrag?: string
  kritisierter_autor?: string
  kritik_typ?: string[]
  personen?: string[]
  institutionen?: string[]
  gesetze_vorlagen?: string[]
  these?: string
  zusammenfassung?: string
  // Extended source attribution
  quelle_url?: string
  quelle_datum?: string
  quelle_format?: string
  quelle_sendung?: string
  quelle_redaktion?: string
  // Editorial
  kritik_schwere?: 1 | 2 | 3
  verwandte_artikel?: string[]
  muster_id?: string
}

export interface Article {
  slug: string
  type: 'chronik' | 'analyse' | 'grundlage' | 'medienkritik'
  frontmatter: ArticleFrontmatter
  content: string
}

function getAllMarkdownFiles(): Array<{ filePath: string; slug: string }> {
  if (!fs.existsSync(CONTENT_DIR)) return []

  const results: Array<{ filePath: string; slug: string }> = []
  const typeDirs = fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d: fs.Dirent) => d.isDirectory())
    .map((d: fs.Dirent) => d.name)

  for (const typeDir of typeDirs) {
    const dirPath = path.join(CONTENT_DIR, typeDir)
    const files = fs.readdirSync(dirPath).filter((f: string) => f.endsWith('.md'))
    for (const file of files) {
      results.push({ filePath: path.join(dirPath, file), slug: file.replace(/\.md$/, '') })
    }
  }

  return results
}

function parseArticle(filePath: string, slug: string): Article {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    slug,
    type: data.type as Article['type'],
    frontmatter: data as ArticleFrontmatter,
    content,
  }
}

export function getAllArticles(): Article[] {
  return getAllMarkdownFiles()
    .map(({ filePath, slug }) => parseArticle(filePath, slug))
    .filter(a => a.frontmatter.status === 'published')
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
}

export function getArticlesByType(type: Article['type']): Article[] {
  return getAllArticles().filter(a => a.type === type)
}

export function getArticle(slug: string): Article | null {
  const files = getAllMarkdownFiles()
  const match = files.find(f => f.slug === slug)
  if (!match) return null
  return parseArticle(match.filePath, match.slug)
}

export function getAllSlugs(): string[] {
  return getAllMarkdownFiles().map(f => f.slug)
}

export function getArticlesByCategory(category: string): Article[] {
  return getAllArticles().filter(a =>
    a.frontmatter.categories?.includes(category)
  )
}

export function getAllCategories(): string[] {
  const set = new Set<string>()
  getAllArticles().forEach(a =>
    a.frontmatter.categories?.forEach(c => set.add(c))
  )
  return Array.from(set).sort()
}

export function getAllKritikTypen(): string[] {
  const set = new Set<string>()
  getAllArticles().forEach(a =>
    a.frontmatter.kritik_typ?.forEach(k => set.add(k))
  )
  return Array.from(set).sort()
}

export function getAllMedien(): string[] {
  const set = new Set<string>()
  getAllArticles().forEach(a => {
    const m = a.frontmatter.kritisiertes_medium
    if (m && m.length > 0) set.add(m)
  })
  return Array.from(set).sort()
}

export function getArticlesByKritikTyp(typ: string): Article[] {
  return getAllArticles().filter(a => a.frontmatter.kritik_typ?.includes(typ))
}

export function getArticlesByMedium(medium: string): Article[] {
  return getAllArticles().filter(a => a.frontmatter.kritisiertes_medium === medium)
}
