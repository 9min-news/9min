import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getAllArticles, getAllCategories, getAllKritikTypen, getAllMedien } from '@/lib/content'
import { CategoryFilter } from '@/components/CategoryFilter'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Archiv',
  description: 'Alle Beiträge — durchsuchbar und filterbar.',
}

export default function ArchivPage() {
  const articles = getAllArticles()
  const categories = getAllCategories()
  const kritikTypen = getAllKritikTypen()
  const medien = getAllMedien()

  return (
    <>
      <Header />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 20px 100px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 'clamp(28px, 5vw, 38px)',
          color: 'var(--color-tannengruen)',
          margin: '0 0 12px',
          letterSpacing: '-0.01em',
        }}>
          Archiv
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '17px',
          color: 'var(--color-textgrau)',
          margin: '0 0 48px',
          lineHeight: 1.6,
        }}>
          Alle Beiträge seit Beginn.
        </p>

        <Suspense>
          <CategoryFilter
            articles={articles}
            categories={categories}
            kritikTypen={kritikTypen}
            medien={medien}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
