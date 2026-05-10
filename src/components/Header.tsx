import Link from 'next/link'
import { Logo } from './Logo'

export function Header() {
  return (
    <header
      style={{
        padding: '24px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <Link
        href="/"
        aria-label="9min – Zur Startseite"
        style={{ textDecoration: 'none' }}
      >
        <Logo size={28} />
      </Link>

      <nav aria-label="Hauptnavigation">
        <ul
          style={{
            display: 'flex',
            gap: '28px',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          <li>
            <Link
              href="/grundlagen"
              style={{
                fontFamily: "'GT Sectra', Georgia, serif",
                fontSize: '15px',
                color: '#4A5C4A',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              className="nav-link"
            >
              Grundlagen
            </Link>
          </li>
          <li>
            <Link
              href="/podcast"
              style={{
                fontFamily: "'GT Sectra', Georgia, serif",
                fontSize: '15px',
                color: '#4A5C4A',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              className="nav-link"
            >
              Podcast
            </Link>
          </li>
          <li>
            <Link
              href="/archiv"
              style={{
                fontFamily: "'GT Sectra', Georgia, serif",
                fontSize: '15px',
                color: '#4A5C4A',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              className="nav-link"
            >
              Archiv
            </Link>
          </li>
          <li>
            <Link
              href="/ueber"
              style={{
                fontFamily: "'GT Sectra', Georgia, serif",
                fontSize: '15px',
                color: '#4A5C4A',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              className="nav-link"
            >
              Über
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
