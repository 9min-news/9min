export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function getExcerpt(content: string, maxLength = 200): string {
  const plain = content
    .replace(/^---[\s\S]*?---/, '')       // strip frontmatter if any
    .replace(/<[^>]+>/g, '')              // strip HTML tags
    .replace(/#{1,6}\s/g, '')            // strip markdown headings
    .replace(/\*\*|__|\*|_/g, '')        // strip bold/italic markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // convert links to text
    .replace(/`[^`]+`/g, '')             // strip inline code
    .replace(/\n+/g, ' ')               // collapse newlines
    .trim()

  if (plain.length <= maxLength) return plain
  return plain.slice(0, maxLength).replace(/\s+\S*$/, '') + '…'
}

export function absoluteUrl(path: string): string {
  return `https://9min.ch${path}`
}

export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / 200)
}
