import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nicht gefunden',
  description: 'Diese Seite existiert nicht.',
}

// The 404 is the anti-logo: a closed circle with no wedge.
// No gold anywhere. The signal is missing.
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAFAF7',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      {/* The closed circle — NO WEDGE */}
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        aria-hidden="true"
        style={{ marginBottom: '32px' }}
      >
        <circle cx="90" cy="90" r="80" fill="#1A2E1A" />
        {/* Deliberately no wedge. The circle is complete, closed. */}
      </svg>

      <p
        style={{
          fontFamily: "'GT Sectra', Georgia, serif",
          fontSize: '20px',
          color: '#1A2E1A',
          margin: '0 0 16px',
        }}
      >
        Das Fehlende wurde hier nicht gefunden.
      </p>

      <p
        style={{
          fontFamily: "'GT Sectra', Georgia, serif",
          fontSize: '17px',
          color: '#4A5C4A',
          margin: '0 0 60px',
        }}
      >
        Vielleicht auf der{' '}
        <Link
          href="/"
          style={{
            color: '#D4A847',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Startseite
        </Link>
        .
      </p>

      <p
        style={{
          fontFamily: "'GT Sectra', Georgia, serif",
          fontSize: '13px',
          color: '#8A9C8A',
          margin: 0,
          position: 'fixed',
          bottom: '32px',
        }}
      >
        Oder es wurde nie gesendet.
      </p>
    </div>
  )
}
