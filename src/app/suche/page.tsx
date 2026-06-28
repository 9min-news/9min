import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SearchPage } from '@/components/SearchPage'
import { loadMetadata } from '@/lib/metadata'

export const metadata: Metadata = {
  title: 'Suche — 9min',
  description: 'Alle Beiträge durchsuchen.',
}

export default function SuchePage() {
  const entries = loadMetadata()

  return (
    <>
      <Header />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 20px 100px' }}>
        <Suspense>
          <SearchPage entries={entries} />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
