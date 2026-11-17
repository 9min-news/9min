import { getAllArticles, type Article } from './content'

// Order and intro of the essay series on /essays. An essay joins a group via its frontmatter `series`;
// unknown or missing series fall into «Einzelstücke». Within a group, `seriesIndex` sets the order.
export const ESSAY_SERIES = [
  { name: '9min zu 9min', intro: 'Was 9min ist, woran es misst und warum.', numbered: true },
  { name: 'Grundlagen', intro: 'Die Texte, die den Massstab von 9min begründen.', numbered: false },
  { name: 'Die Toblerone-Serie', intro: 'Vier Teile und ein Nachtrag: was von der Schweiz bleibt, wenn man ihr die Zacken nimmt.', numbered: true },
  { name: 'Rosinenpickerei', intro: 'Zur Karriere eines Vorwurfs, in zwei Teilen.', numbered: true },
  { name: 'Einzelstücke', intro: 'Analysen, die für sich stehen.', numbered: false },
] as const

export interface EssayGroup {
  name: string
  intro: string
  numbered: boolean   // «Teil n» labels and prev/next navigation only for real multi-part series
  essays: Article[]
}

const FALLBACK = 'Einzelstücke'

export function isEssay(a: Article): boolean {
  return a.type === 'analyse' || a.type === 'grundlage'
}

function groupName(a: Article): string {
  const s = a.frontmatter.series
  return ESSAY_SERIES.some(g => g.name === s) ? String(s) : FALLBACK
}

export function getEssayGroups(): EssayGroup[] {
  const essays = getAllArticles().filter(isEssay)
  return ESSAY_SERIES
    .map(g => ({
      name: g.name,
      intro: g.intro,
      numbered: g.numbered,
      essays: essays
        .filter(a => groupName(a) === g.name)
        .sort((a, b) => (a.frontmatter.seriesIndex ?? 999) - (b.frontmatter.seriesIndex ?? 999)
          || String(a.frontmatter.date).localeCompare(String(b.frontmatter.date))),
    }))
    .filter(g => g.essays.length > 0)
}

/** Previous and next essay in the same numbered series (none for «Grundlagen» and «Einzelstücke»). */
export function getSeriesNeighbours(slug: string): { series: string; index: number; total: number; prev?: Article; next?: Article } | null {
  const group = getEssayGroups().find(g => g.numbered && g.essays.some(a => a.slug === slug))
  if (!group) return null
  const i = group.essays.findIndex(a => a.slug === slug)
  return { series: group.name, index: i + 1, total: group.essays.length, prev: group.essays[i - 1], next: group.essays[i + 1] }
}

export function readingMinutes(a: Article): number {
  return a.frontmatter.readingTime ?? Math.max(1, Math.round(a.content.trim().split(/\s+/).length / 200))
}

export function essayLead(a: Article): string {
  const text = a.frontmatter.lead || a.frontmatter.seo?.description || ''
  return text.length > 220 ? text.slice(0, 220).replace(/\s+\S*$/, '') + ' …' : text
}
