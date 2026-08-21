import { putFile } from './github'
import { Draft } from './draft'
import { postTweet } from './xauth'
import { slugify, excerpt } from './utils'

function yaml(value: string): string {
  if (/[:#\[\]{}&*!|>'"%@`,]/.test(value) || value.includes('\n')) {
    return `"${value.replace(/"/g, '\\"')}"`
  }
  return value
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
