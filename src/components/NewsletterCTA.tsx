import { LogoMark } from './LogoMark'

export function NewsletterCTA() {
  return (
    <section
      aria-label="Newsletter abonnieren"
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '0 20px',
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <LogoMark size={32} />
      </div>

      <p
        style={{
          fontFamily: "'GT Sectra', Georgia, serif",
          fontSize: '13px',
          color: '#4A5C4A',
          letterSpacing: '0.05em',
          marginBottom: '20px',
          marginTop: 0,
        }}
      >
        Kein Artikel verpassen.
      </p>

      <form
        action="/api/subscribe"
        method="POST"
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: '380px',
          margin: '0 auto',
        }}
      >
        <input
          type="email"
          name="email"
          required
          placeholder="ihre@email.ch"
          aria-label="E-Mail-Adresse"
          style={{
            flex: '1 1 200px',
            padding: '10px 14px',
            background: '#FAFAF7',
            border: '1px solid #1A2E1A',
            borderRadius: '2px',
            color: '#1A2E1A',
            fontFamily: "'GT Sectra', Georgia, serif",
            fontSize: '15px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            background: '#D4A847',
            color: '#1A2E1A',
            border: 'none',
            borderRadius: '2px',
            fontFamily: "'GT Sectra', Georgia, serif",
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 200ms ease',
          }}
        >
          Abonnieren
        </button>
      </form>
    </section>
  )
}
