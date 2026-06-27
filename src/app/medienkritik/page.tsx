import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getArticlesByType, getAllCategories, getAllKritikTypen, getAllMedien } from '@/lib/content'
import { CategoryFilter } from '@/components/CategoryFilter'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Medienkritik',
  description: 'Analyse der Schweizer Medienberichterstattung — insbesondere SRF/SRG.',
}

export default function MediakritikPage() {
  const articles = getArticlesByType('medienkritik')
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
          Medienkritik
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '17px',
          color: 'var(--color-textgrau)',
          margin: '0 0 48px',
          lineHeight: 1.6,
        }}>
          Analyse der Schweizer Medienberichterstattung. Massstab: was die Mainstream-Medien nicht sagen.
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
