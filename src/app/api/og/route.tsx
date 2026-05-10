import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0D1A0D',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Subtle grain texture via radial gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(30,60,30,0.6) 0%, rgba(10,20,10,0) 70%)',
          display: 'flex',
        }} />

        {/* Gold top rule */}
        <div style={{ width: '48px', height: '2px', background: '#D4A847', marginBottom: '52px', display: 'flex' }} />

        {/* Logomark wedge — simple CSS triangle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '36px' }}>
          <div style={{
            width: '52px', height: '52px',
            borderRadius: '50%',
            border: '2px solid rgba(245,240,232,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: 0, height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: '18px solid #D4A847',
              display: 'flex',
            }} />
          </div>
          <span style={{
            fontSize: '72px',
            fontWeight: '500',
            color: 'rgba(245,240,232,0.92)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            9min
          </span>
        </div>

        {/* Descriptor */}
        <div style={{
          fontSize: '26px',
          fontWeight: '500',
          color: 'rgba(245,240,232,0.82)',
          marginBottom: '18px',
          letterSpacing: '-0.01em',
        }}>
          Der fehlende Moment · Die fehlende Perspektive
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: '18px',
          fontStyle: 'italic',
          color: 'rgba(212,200,180,0.6)',
          textAlign: 'center',
          lineHeight: 1.6,
        }}>
          Schweizer Medienkritik. Registrierender Natur. Mit vorsichtiger Würde.
        </div>

        {/* Gold bottom rule */}
        <div style={{ width: '48px', height: '2px', background: '#D4A847', marginTop: '52px', display: 'flex' }} />
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
