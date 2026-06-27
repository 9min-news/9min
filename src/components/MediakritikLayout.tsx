import { MDXRemote } from 'next-mdx-remote/rsc'
import { Header } from './Header'
import { Footer } from './Footer'
import { ProgressBar } from './ProgressBar'
import { NewsletterCTA } from './NewsletterCTA'
import { InlineNewsletterCTA } from './InlineNewsletterCTA'
import { ShareBar } from './ShareBar'
import { BookmarkButton } from './BookmarkButton'
import { ArticleCard } from './ArticleCard'
import { mdxComponents } from './mdx'
import { formatDate, calculateReadingTime } from '@/lib/utils'
import { getAllArticles } from '@/lib/content'
import { getAllMuster } from '@/lib/muster'
import type { Article } from '@/lib/content'
import Link from 'next/link'

const SCHWERE_LABELS: Record<number, string> = { 1: 'leicht', 2: 'mittel', 3: 'schwerwiegend' }
const SCHWERE_COLORS: Record<number, string> = { 1: '#8A9C8A', 2: '#D4A847', 3: '#B04040' }

export async function MediakritikLayout({ article }: { article: Article }) {
  const { frontmatter, content, slug } = article
  const readingTime = frontmatter.readingTime ?? calculateReadingTime(content)

  const related = (frontmatter.categories ?? []).length
    ? getAllArticles()
        .filter(a =>
          a.slug !== slug &&
          a.type === 'medienkritik' &&
          a.frontmatter.categories?.some(c => frontmatter.categories!.includes(c))
        )
        .slice(0, 3)
    : []

  const musterEntry = frontmatter.muster_id
    ? getAllMuster().find(m => m.id === frontmatter.muster_id)
    : undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    datePublished: frontmatter.date,
    dateModified: frontmatter.updated ?? frontmatter.date,
    author: { '@type': 'Person', name: '9min' },
    publisher: { '@type': 'Organization', name: '9min', url: 'https://9min.ch' },
    description: frontmatter.seo?.description,
    url: `https://9min.ch/${slug}`,
    ...(frontmatter.coverImage ? { image: frontmatter.coverImage } : {}),
  }

  const splitAt = 5
  const paragraphs = content.split(/\n\n+/)
  const firstHalf = paragraphs.slice(0, splitAt).join('\n\n')
  const secondHalf = paragraphs.slice(splitAt).join('\n\n')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProgressBar />
      <Header />

      {/* Cover image — full bleed above content column */}
      {frontmatter.coverImage && (
        <div style={{ width: '100%', maxHeight: '480px', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frontmatter.coverImage}
            alt={frontmatter.title}
            style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      <main style={{ padding: '40px 20px 0', maxWidth: '680px', margin: '0 auto' }}>

        {/* Meta */}
        <div style={{ marginBottom: '32px' }}>
          <span
            style={{
              display: 'block',
              fontFamily: "'GT Sectra', Georgia, serif",
              fontSize: '12px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#D4A847',
              marginBottom: '8px',
            }}
          >
            Medienkritik
          </span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <time
              dateTime={frontmatter.date}
              style={{
                fontFamily: "'GT Sectra', Georgia, serif",
                fontSize: '15px',
                color: '#4A5C4A',
              }}
            >
              {formatDate(frontmatter.date)}
            </time>
            <span style={{ color: '#D4D0C8' }} aria-hidden="true">·</span>
            <span style={{ fontFamily: "'GT Sectra', Georgia, serif", fontSize: '15px', color: '#4A5C4A' }}>
              {readingTime} {readingTime === 1 ? 'Minute' : 'Minuten'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'GT Sectra Display', Georgia, serif",
            fontWeight: 500,
            fontSize: 'clamp(28px, 5.5vw, 40px)',
            lineHeight: 1.15,
            color: '#1A2E1A',
            margin: '0 0 24px',
          }}
        >
          {frontmatter.title}
        </h1>

        {/* Category pills */}
        {frontmatter.categories && frontmatter.categories.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {frontmatter.categories.map(cat => (
              <Link
                key={cat}
                href={`/medienkritik?kategorie=${encodeURIComponent(cat)}`}
                style={{
                  fontFamily: "'GT Sectra', Georgia, serif",
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#4A5C4A',
                  border: '1px solid #D4D0C8',
                  borderRadius: '2px',
                  padding: '4px 10px',
                  textDecoration: 'none',
                }}
              >
                {cat}
              </Link>
            ))}
          </div>
        )}

        {/* Schwere + Muster chips */}
        {(frontmatter.kritik_schwere || musterEntry) && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {frontmatter.kritik_schwere && (
              <span style={{
                fontFamily: "'GT Sectra', Georgia, serif",
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: SCHWERE_COLORS[frontmatter.kritik_schwere] ?? '#8A9C8A',
                border: `1px solid ${SCHWERE_COLORS[frontmatter.kritik_schwere] ?? '#D4D0C8'}`,
                borderRadius: '2px',
                padding: '3px 10px',
              }}>
                {SCHWERE_LABELS[frontmatter.kritik_schwere] ?? 'mittel'}
              </span>
            )}
            {musterEntry && (
              <Link
                href={`/muster/${musterEntry.slug}`}
                style={{
                  fontFamily: "'GT Sectra', Georgia, serif",
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#D4A847',
                  border: '1px solid #D4A847',
                  borderRadius: '2px',
                  padding: '3px 10px',
                  textDecoration: 'none',
                }}
              >
                {musterEntry.id} {musterEntry.title}
              </Link>
            )}
          </div>
        )}

        {/* Quelle link */}
        {frontmatter.quelle_url && (
          <p style={{ marginBottom: '32px' }}>
            <a
              href={frontmatter.quelle_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'GT Sectra', Georgia, serif",
                fontSize: '13px',
                color: '#8A9C8A',
                textDecoration: 'none',
              }}
            >
              Kritisierter Beitrag
              {frontmatter.kritisiertes_medium ? ` (${frontmatter.kritisiertes_medium})` : ''} →
            </a>
          </p>
        )}

        {/* Gold divider */}
        <div
          aria-hidden="true"
          style={{ width: '40%', height: '1px', background: '#D4A847', margin: '0 auto 40px' }}
        />

        {/* Share + Bookmark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', gap: '12px', flexWrap: 'wrap' }}>
          <ShareBar url={`https://9min.ch/${slug}`} title={frontmatter.title} />
          <BookmarkButton slug={slug} />
        </div>

        {/* Article body */}
        <div className="prose-9min" style={{ padding: 0 }}>
          <MDXRemote source={firstHalf} components={mdxComponents} />
          <InlineNewsletterCTA />
          {secondHalf && <MDXRemote source={secondHalf} components={mdxComponents} />}
        </div>

        {/* Closing gold line */}
        <div
          aria-hidden="true"
          style={{ width: '40%', height: '1px', background: '#D4A847', margin: '48px auto' }}
        />

        {/* Original tweet link */}
        {frontmatter.tweetId && (
          <p style={{ textAlign: 'center', marginBottom: '48px' }}>
            <a
              href={`https://x.com/9min_news/status/${frontmatter.tweetId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'GT Sectra', Georgia, serif",
                fontSize: '13px',
                color: '#8A9C8A',
                textDecoration: 'none',
              }}
            >
              Originalbeitrag auf X →
            </a>
          </p>
        )}

        {/* Verwandte Artikel (explicit cross-links) */}
        {frontmatter.verwandte_artikel && frontmatter.verwandte_artikel.length > 0 && (() => {
          const all = getAllArticles()
          const verwandt = frontmatter.verwandte_artikel!
            .map(s => all.find(a => a.slug === s))
            .filter(Boolean) as typeof all
          if (verwandt.length === 0) return null
          return (
            <section style={{ marginBottom: '48px' }}>
              <h2 style={{
                fontFamily: "'GT Sectra', Georgia, serif",
                fontSize: '12px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#8A9C8A',
                marginBottom: '24px',
                fontWeight: 400,
              }}>
                Verwandte Artikel
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {verwandt.map(a => (
                  <li key={a.slug}>
                    <ArticleCard article={a} />
                  </li>
                ))}
              </ul>
            </section>
          )
        })()}

        {/* Related articles */}
        {related.length > 0 && (
          <section style={{ marginBottom: '48px' }}>
            <h2
              style={{
                fontFamily: "'GT Sectra', Georgia, serif",
                fontSize: '12px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#8A9C8A',
                marginBottom: '24px',
                fontWeight: 400,
              }}
            >
              Ähnliche Beiträge
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {related.map(a => (
                <li key={a.slug}>
                  <ArticleCard article={a} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <NewsletterCTA />

      </main>

      <Footer />
    </>
  )
}
