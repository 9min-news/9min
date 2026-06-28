/**
 * Deep enrichment of medienkritik articles using Venice.ai API
 *
 * Usage:
 *   VENICE_INFERENCE_KEY=xxx npx tsx scripts/enrich.ts              # new only
 *   VENICE_INFERENCE_KEY=xxx npx tsx scripts/enrich.ts --force      # re-enrich all
 *   VENICE_INFERENCE_KEY=xxx npx tsx scripts/enrich.ts --slug foo --slug bar  # specific slugs
 *
 * Idempotent: skips files that already have `kritik_schwere` in frontmatter (unless --force).
 * After all files, aggregates to src/data/metadata.json.
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'medienkritik')
const META_OUT = path.join(process.cwd(), 'src', 'data', 'metadata.json')
const API_KEY = process.env.VENICE_INFERENCE_KEY
const VENICE_BASE = 'https://api.venice.ai/api/v1'
const MODEL = 'zai-org-glm-5-2'
const RATE_LIMIT_MS = 1000

const FORCE = process.argv.includes('--force')
const AGGREGATE_ONLY = process.argv.includes('--aggregate-only')
const SLUG_ARGS: string[] = []
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '--slug' && process.argv[i + 1]) {
    SLUG_ARGS.push(process.argv[i + 1])
    i++
  }
}

// ---------------------------------------------------------------------------
// Taxonomies
// ---------------------------------------------------------------------------

const TAXONOMY = [
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
  'Klima/Energie',
  'Zensur/Meinungsfreiheit',
  'Sicherheitspolitik',
]

const KRITIK_TYPEN = [
  'Auslassung',
  'Framing',
  'Fehlinformation',
  'Selektion',
  'Kontextmangel',
  'Interessenkonflikt',
  'Einordnungsfehler',
  'Behördenpropaganda',
  'Asymmetrie',
  'Quotenfüllung',
  'Autoritätsargument',
  'False Equivalence',
]

const QUELLE_FORMATE = ['Broadcast', 'Online-Artikel', 'Print', 'Podcast'] as const

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EnrichResult {
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
  // New fields
  quelle_datum: string
  quelle_format: string
  quelle_sendung: string
  quelle_redaktion: string
  kritik_schwere: number
  muster_id: string
}

interface MetadataEntry {
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
  // New fields
  quelle_datum: string
  quelle_format: string
  quelle_sendung: string
  quelle_redaktion: string
  kritik_schwere: number
  muster_id: string
}

// ---------------------------------------------------------------------------
// Venice.ai call
// ---------------------------------------------------------------------------

async function enrich(title: string, body: string): Promise<EnrichResult> {
  const systemPrompt = `Du bist Analyst für Schweizer Medienkritik. Analysiere diesen Artikel von 9min.ch.
9min's Methode: empirische Disziplin, Trennung von Fakten und Narrativen, Adressierbarkeit von Verantwortung.

Antworte NUR mit validem JSON ohne Erklärung oder Markdown-Codeblock, exakt dieses Schema:
{
  "categories": string[],
  "themen": string[],
  "tags": string[],
  "kritisiertes_medium": string,
  "kritisierter_beitrag": string,
  "kritisierter_autor": string,
  "kritik_typ": string[],
  "personen": string[],
  "institutionen": string[],
  "gesetze_vorlagen": string[],
  "these": string,
  "zusammenfassung": string,
  "quelle_datum": string,
  "quelle_format": string,
  "quelle_sendung": string,
  "quelle_redaktion": string,
  "kritik_schwere": number,
  "muster_id": string
}

Regeln:
- categories: 1–3 Werte aus TAXONOMY
- themen: 2–5 präzise Themen auf Deutsch
- tags: 3–8 deutsche Stichworte
- kritisiertes_medium: IMMER AUSFÜLLEN. Identifiziere die primäre Quelle, die kritisiert oder analysiert wird:
  * Traditionelle Medien: exakter Name, z.B. "SRF News", "SRF Tagesschau", "Tages-Anzeiger", "NZZ"
  * Behörden/Regierung: z.B. "Bundesrat", "Bund", "EDA", "BAG", "EJPD", "BFM", "SNB", "SECO"
  * Internationale Institutionen: z.B. "EU-Rat", "EU-Kommission", "OSZE", "WHO", "IWF"
  * Politische Akteure: z.B. "SVP", "SP", "Parlament" — wenn deren Kommunikation analysiert wird
  * Wenn mehrere Quellen: nenne die wichtigste
  * Nur wenn der Artikel wirklich keine externe Quelle analysiert (reine 9min-Eigenanalyse): "9min.ch"
  * NIEMALS leer lassen
- kritisierter_beitrag: Titel/Bezeichnung des kritisierten Beitrags, Rede, Dokuments oder Videos, oder ""
- kritisierter_autor: Name des Journalisten, Politikers oder Autors falls genannt, oder ""
- kritik_typ: 1–3 Werte aus KRITIK_TYPEN — welche Kommunikationsfehler macht die kritisierte Quelle?
  WICHTIG — Definitionen (verwechsle diese NICHT):
  * Auslassung: FEHLENDE Information — wesentliche Fakten werden weggelassen ("was nicht gesagt wird")
  * Fehlinformation: FALSCHE Information — sachlich unrichtige Aussagen werden als wahr präsentiert (selten; nur wenn explizit falsche Fakten belegt sind)
  * Framing: Die Darstellungsweise verzerrt die Wahrnehmung, obwohl die Fakten stimmen könnten
  * Kontextmangel: Fakten fehlt der nötige historische/sachliche Hintergrund — nicht dieselbe wie Auslassung (hier ist der Sachverhalt bekannt, der Rahmen fehlt)
  * Selektion: Einseitige Quellen- oder Stimmenwahl, um eine Sichtweise zu stützen
  * Behördenpropaganda: Amtliche Kommunikation unkritisch als Journalismus ausgegeben
  * Asymmetrie: Gleiche Sachverhalte werden ungleich behandelt
  * Interessenkonflikt: Berichterstattung durch institutionelle/persönliche Interessen beeinflusst
  * Einordnungsfehler: Falscher Bedeutungsrahmen/Kategorie für ein Ereignis
  * Autoritätsargument: Expertenmeinungen werden als Fakten präsentiert ohne Grundlage zu hinterfragen
  * Quotenfüllung: Schein-Ausgewogenheit durch schwache/bedeutungslose Gegenstimmen
  * False Equivalence: Ungleichwertige Positionen werden als gleichwertig behandelt
- personen: namentlich genannte Personen
- institutionen: genannte Institutionen, Behörden, Medien
- gesetze_vorlagen: genannte Gesetze, Initiativen, Abstimmungsvorlagen
- these: Kernthese des Artikels in 1 präzisen Satz auf Deutsch
- zusammenfassung: 2–3 Sätze neutrale Zusammenfassung auf Deutsch
- quelle_datum: Erscheinungsdatum des kritisierten Beitrags als ISO-Datum (YYYY-MM-DD), oder "" wenn unbekannt
- quelle_format: eines von QUELLE_FORMATE oder "" wenn unbekannt — bei Behördentext/Rede: "Online-Artikel"
- quelle_sendung: Name der Sendung/Serie (z.B. "Tagesschau", "Echo der Zeit"), oder ""
- quelle_redaktion: Redaktion/Ressort (z.B. "SRF News", "Inland"), oder ""
- kritik_schwere: 1 (leicht, handwerklicher Fehler) | 2 (mittel, verzerrtes Bild) | 3 (schwerwiegend, schadet dem demokratischen Diskurs messbar)
- muster_id: leer lassen ("")

TAXONOMY: ${JSON.stringify(TAXONOMY)}
KRITIK_TYPEN: ${JSON.stringify(KRITIK_TYPEN)}
QUELLE_FORMATE: ${JSON.stringify(QUELLE_FORMATE)}`

  const resp = await fetch(`${VENICE_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Titel: ${title}\n\n${body}` },
      ],
      temperature: 0.1,
      max_tokens: 2500,
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Venice API ${resp.status}: ${err}`)
  }

  const data = await resp.json() as { choices: Array<{ message: { content: string } }> }
  let raw = data.choices[0].message.content.trim()

  // Strip markdown code fences if present
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  const parsed = JSON.parse(raw) as EnrichResult
  return parsed
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function filterEnum(values: unknown, allowed: string[]): string[] {
  if (!Array.isArray(values)) return []
  return (values as unknown[]).filter(v => typeof v === 'string' && allowed.includes(v)) as string[]
}

function toStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) return []
  return (values as unknown[]).filter(v => typeof v === 'string' && (v as string).length > 0) as string[]
}

function toStr(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toSchwere(value: unknown): 1 | 2 | 3 {
  const n = Number(value)
  if (n === 1 || n === 2 || n === 3) return n as 1 | 2 | 3
  return 2
}

function validate(raw: EnrichResult): EnrichResult {
  const format = toStr(raw.quelle_format)
  return {
    categories: filterEnum(raw.categories, TAXONOMY),
    themen: toStringArray(raw.themen).slice(0, 5),
    tags: toStringArray(raw.tags).slice(0, 8),
    kritisiertes_medium: toStr(raw.kritisiertes_medium),
    kritisierter_beitrag: toStr(raw.kritisierter_beitrag),
    kritisierter_autor: toStr(raw.kritisierter_autor),
    kritik_typ: filterEnum(raw.kritik_typ, KRITIK_TYPEN).slice(0, 3),
    personen: toStringArray(raw.personen),
    institutionen: toStringArray(raw.institutionen),
    gesetze_vorlagen: toStringArray(raw.gesetze_vorlagen),
    these: toStr(raw.these),
    zusammenfassung: toStr(raw.zusammenfassung),
    quelle_datum: /^\d{4}-\d{2}-\d{2}$/.test(toStr(raw.quelle_datum)) ? toStr(raw.quelle_datum) : '',
    quelle_format: (QUELLE_FORMATE as readonly string[]).includes(format) ? format : '',
    quelle_sendung: toStr(raw.quelle_sendung),
    quelle_redaktion: toStr(raw.quelle_redaktion),
    kritik_schwere: toSchwere(raw.kritik_schwere),
    muster_id: '',
  }
}

// ---------------------------------------------------------------------------
// Reading time
// ---------------------------------------------------------------------------

function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (AGGREGATE_ONLY) {
    aggregate()
    return
  }
  if (!API_KEY) {
    console.error('Missing VENICE_INFERENCE_KEY env var')
    process.exit(1)
  }

  const allFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).sort()

  const files = SLUG_ARGS.length > 0
    ? allFiles.filter(f => SLUG_ARGS.includes(f.replace(/\.md$/, '')))
    : allFiles

  if (SLUG_ARGS.length > 0) {
    console.log(`Targeting ${files.length} specific article(s): ${files.join(', ')}`)
  }
  if (FORCE) console.log('--force: re-enriching already-enriched articles')

  let done = 0
  let skipped = 0
  let errors = 0

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)

    const alreadyEnriched = data.kritik_schwere !== undefined && data.kritik_schwere !== null && data.kritik_schwere !== ''
    if (alreadyEnriched && !FORCE) {
      console.log(`  skip  ${file}`)
      skipped++
      continue
    }

    const title = String(data.title ?? '')

    try {
      const result = validate(await enrich(title, content))

      data.categories = result.categories
      data.themen = result.themen
      data.tags = result.tags
      data.kritisiertes_medium = result.kritisiertes_medium
      data.kritisierter_beitrag = result.kritisierter_beitrag
      data.kritisierter_autor = result.kritisierter_autor
      data.kritik_typ = result.kritik_typ
      data.personen = result.personen
      data.institutionen = result.institutionen
      data.gesetze_vorlagen = result.gesetze_vorlagen
      data.these = result.these
      data.zusammenfassung = result.zusammenfassung
      data.quelle_datum = result.quelle_datum
      data.quelle_format = result.quelle_format
      data.quelle_sendung = result.quelle_sendung
      data.quelle_redaktion = result.quelle_redaktion
      data.kritik_schwere = result.kritik_schwere
      // muster_id left blank — manual curation only

      const updated = matter.stringify(content, data)
      fs.writeFileSync(filePath, updated)

      console.log(`  ✓  ${file}`)
      console.log(`       categories:  [${result.categories.join(', ')}]`)
      console.log(`       kritik_typ:  [${result.kritik_typ.join(', ')}]`)
      console.log(`       schwere:     ${result.kritik_schwere}`)
      console.log(`       medium:      ${result.kritisiertes_medium || '—'}`)
      console.log(`       quelle_fmt:  ${result.quelle_format || '—'}`)
      console.log(`       these:       ${result.these.slice(0, 80)}`)

      done++
    } catch (e) {
      console.error(`  ✗  ${file}: ${e}`)
      errors++
    }

    await new Promise(r => setTimeout(r, RATE_LIMIT_MS))
  }

  console.log(`\nEnrichment done: ${done} enriched, ${skipped} skipped, ${errors} errors`)
  aggregate()
}

void main()

// ---------------------------------------------------------------------------
// Aggregate metadata.json
// ---------------------------------------------------------------------------

function aggregate() {
  console.log('\nAggregating metadata.json…')

  const allFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).sort()
  const entries: MetadataEntry[] = []

  for (const file of allFiles) {
    const filePath = path.join(CONTENT_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)

    if (data.status !== 'published') continue

    const slug = file.replace(/\.md$/, '')

    entries.push({
      slug,
      title: String(data.title ?? ''),
      date: String(data.date ?? ''),
      type: String(data.type ?? 'medienkritik'),
      coverImage: String(data.coverImage ?? ''),
      tweetId: String(data.tweetId ?? ''),
      readingTime: typeof data.readingTime === 'number' ? data.readingTime : readingTime(content),
      categories: Array.isArray(data.categories) ? data.categories as string[] : [],
      themen: Array.isArray(data.themen) ? data.themen as string[] : [],
      tags: Array.isArray(data.tags) ? data.tags as string[] : [],
      kritisiertes_medium: String(data.kritisiertes_medium ?? ''),
      kritisierter_beitrag: String(data.kritisierter_beitrag ?? ''),
      kritisierter_autor: String(data.kritisierter_autor ?? ''),
      kritik_typ: Array.isArray(data.kritik_typ) ? data.kritik_typ as string[] : [],
      personen: Array.isArray(data.personen) ? data.personen as string[] : [],
      institutionen: Array.isArray(data.institutionen) ? data.institutionen as string[] : [],
      gesetze_vorlagen: Array.isArray(data.gesetze_vorlagen) ? data.gesetze_vorlagen as string[] : [],
      these: String(data.these ?? ''),
      zusammenfassung: String(data.zusammenfassung ?? ''),
      quelle_datum: String(data.quelle_datum ?? ''),
      quelle_format: String(data.quelle_format ?? ''),
      quelle_sendung: String(data.quelle_sendung ?? ''),
      quelle_redaktion: String(data.quelle_redaktion ?? ''),
      kritik_schwere: typeof data.kritik_schwere === 'number' ? data.kritik_schwere as 1 | 2 | 3 : 2,
      muster_id: String(data.muster_id ?? ''),
    })
  }

  entries.sort((a, b) => b.date.localeCompare(a.date))

  fs.mkdirSync(path.dirname(META_OUT), { recursive: true })
  fs.writeFileSync(META_OUT, JSON.stringify(entries, null, 2))
  console.log(`✓ Wrote ${entries.length} entries to src/data/metadata.json`)
}
