'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Logo } from './Logo'
import { LoginForm } from './LoginForm'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split(';').find(c => c.trim().startsWith(`${name}=`))
  return match ? decodeURIComponent(match.trim().slice(name.length + 1)) : null
}

export function Header() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    setUserEmail(getCookie('9min_user'))
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        router.push('/suche')
      }
      if (e.key === 'Escape') {
        setShowLoginModal(false)
        setShowUserMenu(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    if (showUserMenu) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [showUserMenu])

  const iconStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#8A9C8A',
    textDecoration: 'none',
    transition: 'color 150ms ease',
    padding: '2px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  } as const

  return (
    <>
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
              gap: '24px',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              alignItems: 'center',
            }}
          >
            {[
              { href: '/medienkritik', label: 'Medienkritik' },
              { href: '/muster', label: 'Muster' },
              { href: '/essays', label: 'Essays' },
              { href: '/ueber', label: 'Über' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  style={{
                    fontFamily: "'GT Sectra', Georgia, serif",
                    fontSize: '15px',
                    color: '#4A5C4A',
                    textDecoration: 'none',
                    transition: 'color 200ms ease',
                  }}
                  className="nav-link"
                >
                  {label}
                </Link>
              </li>
            ))}

            {/* Search */}
            <li>
              <Link
                href="/suche"
                aria-label="Suchen"
                style={iconStyle}
                className="nav-link"
              >
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </Link>
            </li>

            {/* Login / User */}
            <li style={{ position: 'relative' }} ref={menuRef}>
              {userEmail ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(v => !v)}
                    aria-label="Benutzermenu"
                    style={iconStyle}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </button>
                  {showUserMenu && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 12px)',
                      background: '#fff',
                      border: '1px solid var(--color-border)',
                      borderRadius: '2px',
                      padding: '8px 0',
                      minWidth: '180px',
                      zIndex: 100,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    }}>
                      <div style={{
                        padding: '8px 16px 10px',
                        borderBottom: '1px solid var(--color-border)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        color: 'var(--color-textgrau-hell)',
                        marginBottom: '4px',
                      }}>
                        {userEmail}
                      </div>
                      <Link
                        href="/merkliste"
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          display: 'block',
                          padding: '8px 16px',
                          fontFamily: 'var(--font-body)',
                          fontSize: '14px',
                          color: 'var(--color-tannengruen)',
                          textDecoration: 'none',
                        }}
                      >
                        Merkliste
                      </Link>
                      <form action="/api/auth/logout" method="POST">
                        <button
                          type="submit"
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 16px',
                            fontFamily: 'var(--font-body)',
                            fontSize: '14px',
                            color: '#8A9C8A',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Abmelden
                        </button>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  aria-label="Anmelden"
                  style={iconStyle}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </button>
              )}
            </li>
          </ul>
        </nav>
      </header>

      {/* Login modal */}
      {showLoginModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Anmelden"
          onClick={e => { if (e.target === e.currentTarget) setShowLoginModal(false) }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26,46,26,0.3)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '120px',
          }}
        >
          <div style={{
            background: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: '2px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px',
            margin: '0 20px',
            position: 'relative',
          }}>
            <button
              onClick={() => setShowLoginModal(false)}
              aria-label="Schliessen"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-textgrau-hell)',
                padding: '4px',
                display: 'flex',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: '20px',
              color: 'var(--color-tannengruen)',
              margin: '0 0 20px',
            }}>
              Anmelden
            </p>
            <LoginForm next={typeof window !== 'undefined' ? window.location.pathname : '/'} />
          </div>
        </div>
      )}
    </>
  )
}
