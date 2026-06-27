import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ArticleCard } from '@/components/ArticleCard'
import { LoginForm } from '@/components/LoginForm'
import { getSession } from '@/lib/session'
import { getSubscriber } from '@/lib/buttondown'
import { getAllArticles } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Merkliste',
  robots: { index: false },
}

export default async function MerklistePage() {
  const email = await getSession()

  return (
    <>
      <Header />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 20px 100px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 'clamp(28px, 5vw, 38px)',
          color: 'var(--color-tannengruen)',
          margin: '0 0 48px',
          letterSpacing: '-0.01em',
        }}>
          Merkliste
        </h1>

        {!email ? (
          <div style={{ maxWidth: '360px' }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: '16px',
              color: 'var(--color-textgrau)',
              margin: '0 0 32px',
              lineHeight: 1.6,
            }}>
              Melden Sie sich an, um Ihre gespeicherten Beiträge zu sehen.
            </p>
            <LoginForm next="/merkliste" />
          </div>
        ) : (
          <BookmarkedArticles email={email} />
        )}
      </main>
      <Footer />
    </>
  )
}

async function BookmarkedArticles({ email }: { email: string }) {
  const subscriber = await getSubscriber(email)
  const slugs: string[] = subscriber?.metadata?.bookmarks ?? []
  const allArticles = getAllArticles()
  const bookmarked = slugs
    .map(slug => allArticles.find(a => a.slug === slug))
    .filter(Boolean) as ReturnType<typeof getAllArticles>

  if (bookmarked.length === 0) {
    return (
      <p style={{
        fontFamily: 'var(--font-body)',
        fontStyle: 'italic',
        color: 'var(--color-textgrau-hell)',
        fontSize: '16px',
      }}>
        Noch keine gespeicherten Beiträge. Klicken Sie auf «Merken» auf einem Artikel.
      </p>
    )
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {bookmarked.map(article => (
        <li key={article.slug}>
          <ArticleCard article={article} />
        </li>
      ))}
    </ul>
  )
}
