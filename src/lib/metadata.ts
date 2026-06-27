import fs from 'fs'
import path from 'path'

export interface MetadataEntry {
  slug: string
  title: string
  date: string
  type: string
  coverImage: string
  tweetId: string
  readingTime: number
  categories: string[]
  themen: string[]
  tags: string[]
  kritisiertes_medium: string
  kritisierter_beitrag: string
  kritisierter_autor: string
  kritik_typ: string[]
  personen: string[]
  institutionen: string[]
  gesetze_vorlagen: string[]
  these: string
  zusammenfassung: string
  // Extended source attribution
  quelle_datum: string
  quelle_format: string
  quelle_sendung: string
  quelle_redaktion: string
  // Editorial
  kritik_schwere: number
  muster_id: string
}

export function loadMetadata(): MetadataEntry[] {
  const filePath = path.join(process.cwd(), 'src', 'data', 'metadata.json')
  if (!fs.existsSync(filePath)) return []
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as MetadataEntry[]
}

export function getAllKritikTypenFromMetadata(): string[] {
  const set = new Set<string>()
  loadMetadata().forEach(e => e.kritik_typ.forEach(k => set.add(k)))
  return Array.from(set).sort()
}

export function getAllMedienFromMetadata(): string[] {
  const set = new Set<string>()
  loadMetadata().forEach(e => { if (e.kritisiertes_medium) set.add(e.kritisiertes_medium) })
  return Array.from(set).sort()
}
