import type { Metadata } from 'next'
import Link from 'next/link'
import { LogoMark } from '@/components/LogoMark'
import { ComingSoonVideo } from '@/components/ComingSoonVideo'

export const metadata: Metadata = {
  title: 'Danke',
  description: 'Du bist dabei.',
  robots: { index: false },
}

export default function DankePage() {
  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; background: #0D1A0D; }
        .dk-video {
          position: fixed; inset: 0; width: 100%; height: 100%;
          object-fit: cover; z-index: 0;
        }
        .dk-overlay {
          position: fixed; inset: 0; z-index: 1;
          background: linear-gradient(
            to bottom,
            rgba(10,20,10,0.65) 0%,
            rgba(10,20,10,0.8) 50%,
            rgba(10,20,10,0.9) 100%
          );
        }
        .dk-content {
          position: relative; z-index: 2;
          min-height: 100svh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 24px;
          text-align: center;
        }
        .dk-logo { margin-bottom: 48px; opacity: 0.9; }
        .dk-rule {
          width: 40px; height: 1px;
          background: #D4A847;
          margin: 0 auto 40px;
        }
        .dk-heading {
          font-family: 'GT Sectra Display', Georgia, serif;
          font-weight: 500;
          font-size: clamp(26px, 5vw, 38px);
          color: rgba(245,240,232,0.92);
          margin: 0 0 20px;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }
        .dk-body {
          font-family: 'GT Sectra', Georgia, serif;
          font-style: italic;
          font-size: clamp(15px, 2.5vw, 18px);
          color: rgba(212,200,180,0.7);
          margin: 0 0 52px;
          line-height: 1.65;
          max-width: 400px;
        }
        .dk-back {
          font-family: 'GT Sectra', Georgia, serif;
          font-size: 13px;
          letter-spacing: 0.08em;
          color: rgba(212,208,200,0.45);
          text-decoration: none;
          transition: color 200ms ease;
        }
        .dk-back:hover { color: rgba(212,208,200,0.8); }
      `}</style>

      <ComingSoonVideo className="dk-video" />
      <div className="dk-overlay" />

      <div className="dk-content">
        <div className="dk-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
          <LogoMark size={36} circleColor="rgba(245,240,232,0.85)" wedgeColor="#D4A847" animated />
          <span style={{
            fontFamily: "'GT Sectra Display', Georgia, serif",
            fontWeight: 500,
            fontSize: '28px',
            color: 'rgba(245,240,232,0.85)',
            letterSpacing: '-0.01em',
            lineHeight: 1,
          }}>9min</span>
        </div>

        <div className="dk-rule" />

        <p className="dk-heading">Danke — du bist dabei.</p>

        <p className="dk-body">
          Du erhältst neue Beiträge direkt in dein Postfach.<br />
          Wir melden uns, wenn es losgeht.
        </p>

        <Link href="/" className="dk-back">← Zurück</Link>
      </div>
    </>
  )
}
