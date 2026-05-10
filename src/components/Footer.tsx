import Link from 'next/link'
import { LogoMark } from './LogoMark'

export function Footer() {
  return (
    <footer
      style={{
        background: '#0E150E',
        padding: '80px 40px',
        textAlign: 'center',
        marginTop: '80px',
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <LogoMark
          size={32}
          circleColor="#FAFAF7"
          wedgeColor="#D4A847"
        />
      </div>

      <nav aria-label="Seitennavigation" style={{ marginBottom: '32px' }}>
        <ul
          style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          <li>
            <Link
              href="/archiv"
              style={{
                fontFamily: "'GT Sectra', Georgia, serif",
                fontSize: '14px',
                color: '#8A9C8A',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              className="footer-link"
            >
              Archiv
            </Link>
          </li>
          <li>
            <Link
              href="/ueber"
              style={{
                fontFamily: "'GT Sectra', Georgia, serif",
                fontSize: '14px',
                color: '#8A9C8A',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              className="footer-link"
            >
              Über
            </Link>
          </li>
          <li>
            <a
              href="/rss.xml"
              style={{
                fontFamily: "'GT Sectra', Georgia, serif",
                fontSize: '14px',
                color: '#8A9C8A',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              className="footer-link"
            >
              RSS
            </a>
          </li>
        </ul>
      </nav>

      <p
        style={{
          fontFamily: "'GT Sectra', Georgia, serif",
          fontSize: '13px',
          color: '#8A9C8A',
          margin: 0,
        }}
      >
        © {new Date().getFullYear()} 9min.ch
      </p>
    </footer>
  )
}
