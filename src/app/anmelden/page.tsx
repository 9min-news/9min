import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LoginForm } from '@/components/LoginForm'

export const metadata: Metadata = {
  title: 'Anmelden',
  robots: { index: false },
}

export default async function AnmeldenPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next = '/' } = await searchParams
  const safeNext = next.startsWith('/') ? next : '/'

  return (
    <>
      <Header />
      <main style={{ maxWidth: '400px', margin: '0 auto', padding: '80px 20px 100px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: '28px',
          color: 'var(--color-tannengruen)',
          margin: '0 0 32px',
          letterSpacing: '-0.01em',
        }}>
          Anmelden
        </h1>
        <LoginForm next={safeNext} />
      </main>
      <Footer />
    </>
  )
}
