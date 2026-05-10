interface PullQuoteProps {
  children: React.ReactNode
  attribution?: string
}

// Used inside article MDX for the article's own strongest sentences.
// Gold left border, GT Sectra Italic, tannengrün text.
// Different from Blockquote (other people's words).
export function PullQuote({ children, attribution }: PullQuoteProps) {
  return (
    <aside
      style={{
        borderLeft: '3px solid #D4A847',
        paddingLeft: '20px',
        margin: '40px 0',
        fontStyle: 'italic',
        color: '#1A2E1A',
        fontFamily: "'GT Sectra', Georgia, serif",
        fontSize: '1.15em',
        lineHeight: 1.6,
      }}
    >
      <p style={{ margin: 0 }}>{children}</p>
      {attribution && (
        <cite
          style={{
            display: 'block',
            marginTop: '0.5em',
            fontSize: '0.85em',
            fontStyle: 'normal',
            color: '#4A5C4A',
          }}
        >
          — {attribution}
        </cite>
      )}
    </aside>
  )
}
