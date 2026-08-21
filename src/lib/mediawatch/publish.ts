import { putFile } from './github'
import { Draft } from './draft'
import { postTweet } from './xauth'

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

function excerpt(markdown: string, max = 155): string {
  const plain = markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*/g, '').replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ').trim()
  if (plain.length <= max) return plain
  return plain.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

function yaml(value: string): string {
  if (/[:#\[\]{}&*!|>'"%@`,]/.test(value) || value.includes('\n')) {
    return `"${value.replace(/"/g, '\\"')}"`
  }
  return value
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

export async function publishWeb(draft: Draft): Promise<string> {
  const slug = slugify(draft.title)
  const date = new Date().toISOString().slice(0, 10)
  const desc = excerpt(draft.markdown)
  const filePath = `content/medienkritik/${slug}.md`

  const frontmatter = [
    '---',
    `title: ${yaml(draft.title)}`,
    `date: "${date}"`,
    `status: published`,
    `type: medienkritik`,
    `coverImage: ""`,
    `tweetId: ""`,
    `categories: []`,
    `tags: []`,
    `seo:`,
    `  description: ${yaml(desc)}`,
    draft.quelle ? `kritisiertes_medium: ${yaml(draft.quelle)}` : null,
    draft.sourceUrl ? `quelle_url: "${draft.sourceUrl}"` : null,
    '---',
  ].filter(Boolean).join('\n')

  await putFile(
    filePath,
    `${frontmatter}\n\n${draft.markdown}\n`,
    `mediawatch: ${draft.title}`
  )

  return `https://9min.ch/${slug}`
}

export async function publishX(xText: string): Promise<string> {
  return postTweet(xText)
}
