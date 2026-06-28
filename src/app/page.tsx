import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles, getArticlesByType } from '@/lib/content'
import { ArticleCard } from '@/components/ArticleCard'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LogoMark } from '@/components/LogoMark'
import { ComingSoonVideo } from '@/components/ComingSoonVideo'
import { formatDate, getExcerpt } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  chronik: 'Chronik',
  analyse: 'Analyse',
  grundlage: 'Grundlage',
  medienkritik: 'Medienkritik',
}

export const metadata: Metadata = {
  title: '9min',
  description: 'Schweizer Medienkritik. Registrierender Natur. Mit vorsichtiger Würde.',
}

// ---------------------------------------------------------------------------
// Coming soon
// ---------------------------------------------------------------------------

function ComingSoonPage() {
  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; background: #0D1A0D; }
        .cs-video {
          position: fixed; inset: 0; width: 100%; height: 100%;
          object-fit: cover; z-index: 0;
        }
        .cs-overlay {
          position: fixed; inset: 0; z-index: 1;
          background: linear-gradient(
            to bottom,
            rgba(10,20,10,0.6) 0%,
            rgba(10,20,10,0.75) 50%,
            rgba(10,20,10,0.85) 100%
          );
        }
        .cs-content {
          position: relative; z-index: 2;
          min-height: 100svh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 24px;
          text-align: center;
        }
        .cs-logo { margin-bottom: 28px; opacity: 0.95; }
        .cs-descriptor {
          font-family: 'GT Sectra Display', Georgia, serif;
          font-weight: 500;
          font-size: clamp(18px, 3.5vw, 26px);
          color: rgba(245,240,232,0.88);
          margin: 0 0 20px;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }
        .cs-tagline {
          font-family: 'GT Sectra', Georgia, serif;
          font-style: italic;
          font-size: clamp(15px, 3vw, 19px);
          color: rgba(212,200,180,0.8);
          margin: 0 0 48px;
          letter-spacing: 0.01em;
          max-width: 480px;
        }
        .cs-label {
          font-family: 'GT Sectra', Georgia, serif;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #D4A847;
          margin-bottom: 28px;
        }
        .cs-form {
          display: flex; gap: 8px; flex-wrap: wrap;
          justify-content: center;
          max-width: 400px; margin: 0 auto 48px;
        }
        .cs-input {
          flex: 1 1 200px;
          padding: 11px 16px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(212,208,200,0.35);
          border-radius: 2px;
          color: #F5F0E8;
          font-family: 'GT Sectra', Georgia, serif;
          font-size: 15px;
          outline: none;
        }
        .cs-input::placeholder { color: rgba(212,208,200,0.4); }
        .cs-input:focus { border-color: rgba(212,168,71,0.6); }
        .cs-btn {
          padding: 11px 22px;
          background: #D4A847;
          color: #0D1A0D;
          border: none; border-radius: 2px;
          font-family: 'GT Sectra', Georgia, serif;
          font-size: 15px; font-weight: 600;
          cursor: pointer; white-space: nowrap;
        }
        .cs-x-link {
          font-family: 'GT Sectra', Georgia, serif;
          font-size: 13px;
          letter-spacing: 0.08em;
          color: rgba(212,208,200,0.5);
          text-decoration: none;
          transition: color 200ms ease;
        }
        .cs-x-link:hover { color: rgba(212,208,200,0.85); }
      `}</style>

      <ComingSoonVideo className="cs-video" />
      <div className="cs-overlay" />

      <div className="cs-content">
        <div className="cs-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
          <LogoMark size={44} circleColor="rgba(245,240,232,0.9)" wedgeColor="#D4A847" animated />
          <span style={{
            fontFamily: "'GT Sectra Display', Georgia, serif",
            fontWeight: 500,
            fontSize: '33px',
            color: 'rgba(245,240,232,0.9)',
            letterSpacing: '-0.01em',
            lineHeight: 1,
          }}>9min</span>
        </div>

        <p className="cs-descriptor">
          Der fehlende Moment🔻 Die fehlende Perspektive
        </p>

        <p className="cs-tagline">
          Schweizer Medienkritik.<br />
          Registrierender Natur. Mit vorsichtiger Würde.
        </p>

        <p className="cs-label">Erscheint bald</p>

        <form className="cs-form" action="/api/subscribe" method="POST">
          <input
            className="cs-input"
            type="email"
            name="email"
            required
            placeholder="ihre@email.ch"
            aria-label="E-Mail-Adresse"
          />
          <button className="cs-btn" type="submit">
            Benachrichtigen
          </button>
        </form>

        <a
          className="cs-x-link"
          href="https://x.com/9min_news"
          target="_blank"
          rel="noopener noreferrer"
        >
          @9min_news
        </a>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main site
// ---------------------------------------------------------------------------

function MainPage() {
  const recent = getAllArticles().slice(0, 6)
  const grundlagen = getArticlesByType('grundlage').sort(
    (a, b) => (a.frontmatter.seriesIndex ?? 99) - (b.frontmatter.seriesIndex ?? 99)
  )
  const [featured, ...feed] = recent

  return (
    <>
      <Header />

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '0 20px' }}>

        {/* Hero tagline + search */}
        <div style={{ padding: '56px 0 48px', textAlign: 'center' }}>
          <p style={{
            fontFamily: "'GT Sectra', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 'clamp(17px, 3vw, 21px)',
            color: '#4A5C4A',
            margin: '0 0 36px',
            lineHeight: 1.5,
          }}>
            Die Abwesenheit ist die Nachricht.
          </p>
          <Link
            href="/suche"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '11px 20px',
              border: '1px solid #D4D0C8',
              borderRadius: '2px',
              fontFamily: "'GT Sectra', Georgia, serif",
              fontSize: '14px',
              color: '#8A9C8A',
              textDecoration: 'none',
              transition: 'border-color 150ms ease',
              minWidth: '260px',
              justifyContent: 'flex-start',
            }}
            className="search-trigger"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Suchen…
            <span style={{ marginLeft: 'auto', fontSize: '11px', letterSpacing: '0.1em', opacity: 0.6 }}>⌘K</span>
          </Link>
        </div>

        {/* Featured latest */}
        {featured && (
          <>
            <article style={{ marginBottom: '48px' }}>
              <Link href={`/${featured.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <span style={{
                  display: 'block',
                  fontFamily: "'GT Sectra', Georgia, serif",
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: featured.type === 'medienkritik' ? '#4A5C4A' : '#D4A847',
                  marginBottom: '10px',
                }}>
                  {TYPE_LABELS[featured.type] ?? featured.type}
                </span>
                <h1 style={{
                  fontFamily: "'GT Sectra Display', Georgia, serif",
                  fontWeight: 500,
                  fontSize: 'clamp(26px, 5vw, 34px)',
                  lineHeight: 1.2,
                  color: '#1A2E1A',
                  margin: '0 0 10px',
                }}>
                  {featured.frontmatter.title}
                </h1>
                <time dateTime={featured.frontmatter.date} style={{
                  fontFamily: "'GT Sectra', Georgia, serif",
                  fontSize: '13px',
                  color: '#8A9C8A',
                  display: 'block',
                  marginBottom: '16px',
                }}>
                  {formatDate(featured.frontmatter.date)}
                </time>
                <p style={{
                  fontFamily: "'GT Sectra', Georgia, serif",
                  fontSize: '17px',
                  lineHeight: 1.65,
                  color: '#4A5C4A',
                  margin: 0,
                }}>
                  {getExcerpt(featured.content, 240)}
                </p>
              </Link>
            </article>

            <div aria-hidden="true" style={{ width: '40%', height: '1px', background: '#D4A847', margin: '0 auto 48px' }} />
          </>
        )}

        {/* Zum Einstieg — Grundlagen */}
        {grundlagen.length > 0 && (
          <section style={{ marginBottom: '56px' }}>
            <p style={{
              fontFamily: "'GT Sectra', Georgia, serif",
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#D4A847',
              margin: '0 0 20px',
            }}>
              Zum Einstieg
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0' }}>
              {grundlagen.map((a, i) => (
                <li key={a.slug} style={{
                  borderTop: i === 0 ? '1px solid #E8E4DC' : undefined,
                  borderBottom: '1px solid #E8E4DC',
                }}>
                  <Link href={`/${a.slug}`} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '16px',
                    padding: '14px 0',
                    textDecoration: 'none',
                  }}>
                    <span style={{
                      fontFamily: "'GT Sectra Display', Georgia, serif",
                      fontSize: '16px',
                      color: '#1A2E1A',
                      lineHeight: 1.3,
                    }}>
                      {a.frontmatter.title}
                    </span>
                    <time style={{ fontFamily: "'GT Sectra', Georgia, serif", fontSize: '12px', color: '#8A9C8A', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {formatDate(a.frontmatter.date)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Recent feed */}
        {feed.length > 0 && (
          <section style={{ marginBottom: '80px' }}>
            <p style={{
              fontFamily: "'GT Sectra', Georgia, serif",
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#8A9C8A',
              margin: '0 0 20px',
            }}>
              Zuletzt erschienen
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {feed.map(article => (
                <li key={article.slug}>
                  <ArticleCard article={article} />
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '36px', textAlign: 'center' }}>
              <Link href="/medienkritik" style={{
                fontFamily: "'GT Sectra', Georgia, serif",
                fontSize: '13px',
                color: '#8A9C8A',
                textDecoration: 'none',
                letterSpacing: '0.05em',
              }}>
                Alle Beiträge →
              </Link>
            </div>
          </section>
        )}

      </main>

      <Footer />
    </>
  )
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export default function HomePage() {
  return process.env.COMING_SOON === '1' ? <ComingSoonPage /> : <MainPage />
}
