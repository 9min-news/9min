import { MDXRemote } from 'next-mdx-remote/rsc'
import { Header } from './Header'
import { Footer } from './Footer'
import { ProgressBar } from './ProgressBar'
import { NewsletterCTA } from './NewsletterCTA'
import { ArticleCard } from './ArticleCard'
import { mdxComponents } from './mdx'
import { AudioPlayer } from './AudioPlayer'
import { formatDate } from '@/lib/utils'
import { getArticle } from '@/lib/content'
import type { Article } from '@/lib/content'

interface GrundlageLayoutProps {
  article: Article
}

export async function GrundlageLayout({ article }: GrundlageLayoutProps) {
  const { frontmatter, content, slug } = article

  const relatedArticles = (frontmatter.related ?? [])
    .map(s => getArticle(s))
    .filter((a): a is Article => a !== null)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    datePublished: frontmatter.date,
    dateModified: frontmatter.updated ?? frontmatter.date,
    author: { '@type': 'Person', name: 'Henry Barrows' },
    publisher: { '@type': 'Organization', name: '9min', url: 'https://9min.ch' },
    description: frontmatter.seo?.description,
    url: `https://9min.ch/${slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProgressBar />
      <Header />

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
            Grundlage
          </span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
            {frontmatter.updated && (
              <>
                <span style={{ color: '#D4D0C8' }} aria-hidden="true">·</span>
                <span
                  style={{
                    fontFamily: "'GT Sectra', Georgia, serif",
                    fontSize: '15px',
                    color: '#8A9C8A',
                  }}
                >
                  Aktualisiert {formatDate(frontmatter.updated)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Title — h1, one per page */}
        <h1
          style={{
            fontFamily: "'GT Sectra Display', Georgia, serif",
            fontWeight: 500,
            fontSize: 'clamp(28px, 5vw, 38px)',
            lineHeight: 1.2,
            color: '#1A2E1A',
            margin: '0 0 32px',
          }}
        >
          {frontmatter.title}
        </h1>

        {/* Gold divider */}
        <div
          aria-hidden="true"
          style={{ width: '40%', height: '1px', background: '#D4A847', margin: '0 auto 40px' }}
        />

        {/* Audio player */}
        {frontmatter.audio && (
          <AudioPlayer audio={frontmatter.audio} style={{ margin: '0 0 40px' }} />
        )}

        {/* Article body */}
        <div className="prose-9min" style={{ padding: 0 }}>
          <MDXRemote source={content} components={mdxComponents} />
        </div>

        {/* Closing gold line */}
        <div
          aria-hidden="true"
          style={{ width: '40%', height: '1px', background: '#D4A847', margin: '48px auto 48px' }}
        />

        {/* Related articles */}
        {relatedArticles.length > 0 && (
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
              Verwandte Artikel
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {relatedArticles.map(a => (
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
