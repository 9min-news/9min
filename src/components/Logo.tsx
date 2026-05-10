import { LogoMark } from './LogoMark'

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 28, className }: LogoProps) {
  const textHeight = size
  const textSize = Math.round(size * 0.75)

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${Math.round(size * 0.35)}px`,
        lineHeight: 1,
      }}
    >
      {/* Animated mark — wedge separates on load via CSS animation */}
      <LogoMark size={size} animated />
      {/* Wordmark */}
      <span
        style={{
          fontFamily: "'GT Sectra Display', Georgia, serif",
          fontWeight: 500,
          fontSize: `${textSize}px`,
          lineHeight: `${textHeight}px`,
          color: '#1A2E1A',
          letterSpacing: '-0.01em',
        }}
      >
        9min
      </span>
    </span>
  )
}
