export function slugify(title: string): string {
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

export function excerpt(markdown: string, max = 155): string {
  const plain = markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*/g, '').replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ').trim()
  if (plain.length <= max) return plain
  return plain.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

function lastSentence(markdown: string): string {
  const plain = markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*/g, '').replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ').trim()
  const sentences = plain.match(/[^.!?]+[.!?]+/g) ?? []
  return sentences[sentences.length - 1]?.trim() ?? ''
}

export function buildXText(title: string, markdown: string, url: string): string {
  const last = lastSentence(markdown)
  const candidate = `${title} — ${last} ${url}`
  if (candidate.length <= 280) return candidate
  const short = `${title} ${url}`
  return short.slice(0, 280)
}
