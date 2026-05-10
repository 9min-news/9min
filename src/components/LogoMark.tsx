interface LogoMarkProps {
  size?: number
  circleColor?: string
  wedgeColor?: string
  className?: string
  animated?: boolean
}

export function LogoMark({
  size = 32,
  circleColor = '#1A2E1A',
  wedgeColor = '#D4A847',
  className,
  animated = false,
}: LogoMarkProps) {
  // ViewBox: 0 0 40 40, circle cx=20 cy=20 r=18
  // Wedge: ~54° arc at ~1 o'clock (top-right area)
  // Angles in SVG: 0° = 3 o'clock, measured clockwise
  // 1 o'clock ≈ -60° from 3 o'clock = 300° = -60°
  // Start: -87° (just before 12), End: -33° (just after 1)
  // In radians: start = -1.518, end = -0.576
  // Points on circle r=18, center (20,20):
  //   start: (20 + 18*cos(-87°), 20 + 18*sin(-87°)) ≈ (20.94, 2.05)
  //   end:   (20 + 18*cos(-33°), 20 + 18*sin(-33°)) ≈ (35.10, 10.20)
  const wedgePath = 'M 20 20 L 20.94 2.05 A 18 18 0 0 1 35.10 10.20 Z'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={className}
      style={{ display: 'inline-block', flexShrink: 0 }}
    >
      {/* Full circle */}
      <circle cx="20" cy="20" r="18" fill={circleColor} />
      {/* Wedge — slightly separated (translate toward 1 o'clock direction) */}
      <path
        d={wedgePath}
        fill={wedgeColor}
        transform="translate(1.5 -1.5)"
        className={animated ? 'logo-wedge-animated' : undefined}
        style={animated ? undefined : { transform: 'translate(1.5px, -1.5px)' }}
      />
    </svg>
  )
}
