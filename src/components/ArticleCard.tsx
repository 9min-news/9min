import Link from 'next/link'
import type { Article } from '@/lib/content'
import { formatDate } from '@/lib/utils'

interface ArticleCardProps {
  article: Article
}

const TYPE_LABELS: Record<Article['type'], string> = {
  chronik: 'Chronik',
  analyse: 'Analyse',
  grundlage: 'Grundlage',
}

export function ArticleCard({ article }: ArticleCardProps) {
  const isGold = article.type === 'analyse' || article.type === 'grundlage'

  return (
    <article>
      <Link
        href={`/${article.slug}`}
        style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      >
        <span
          style={{
            display: 'block',
            fontFamily: "'GT Sectra', Georgia, serif",
            fontSize: '12px',
            fontWeight: 400,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: isGold ? '#D4A847' : '#4A5C4A',
            marginBottom: '6px',
          }}
        >
          {TYPE_LABELS[article.type]}
        </span>
        <h2
          style={{
            fontFamily: "'GT Sectra Display', Georgia, serif",
            fontWeight: 500,
            fontSize: '20px',
            lineHeight: 1.3,
            color: '#1A2E1A',
            margin: '0 0 6px',
            transition: 'color 200ms ease',
          }}
          className="article-card-title"
        >
          {article.frontmatter.title}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <time
            dateTime={article.frontmatter.date}
            style={{
              fontFamily: "'GT Sectra', Georgia, serif",
              fontSize: '14px',
              color: '#8A9C8A',
            }}
          >
            {formatDate(article.frontmatter.date)}
          </time>
          {article.frontmatter.audio && (
            <span
              title="Als Podcast verfügbar"
              aria-label="Als Podcast verfügbar"
              style={{ color: '#8A9C8A', display: 'inline-flex', alignItems: 'center' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
              </svg>
            </span>
          )}
        </div>
      </Link>
    </article>
  )
}
