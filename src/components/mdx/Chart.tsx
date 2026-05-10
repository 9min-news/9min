interface ChartProps {
  type?: 'bar' | 'line'
  data?: unknown
  highlight?: string
  caption?: string
}

// Placeholder for future D3.js / hand-built SVG charts.
// Renders a styled container with a placeholder message.
export function Chart({ caption }: ChartProps) {
  return (
    <figure
      style={{
        background: '#F4F1EB',
        border: '1px solid #D4D0C8',
        borderRadius: '2px',
        padding: '2rem',
        margin: '2.5em 0',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          color: '#8A9C8A',
          fontFamily: "'GT Sectra', Georgia, serif",
          fontSize: '15px',
          marginBottom: caption ? '0.75rem' : 0,
        }}
      >
        Diagramm wird geladen
      </div>
      {caption && (
        <figcaption
          style={{
            color: '#8A9C8A',
            fontSize: '13px',
            fontStyle: 'italic',
            marginTop: '0.5rem',
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
