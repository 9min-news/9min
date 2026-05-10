interface BlockquoteProps {
  children: React.ReactNode
}

// Overrides the default <blockquote> in MDX.
// Style: italic, textgrau, left border in tannengrün.
// These are OTHER PEOPLE'S words (vs PullQuote = article's own strongest sentences).
export function Blockquote({ children }: BlockquoteProps) {
  return (
    <blockquote
      style={{
        borderLeft: '1px solid #1A2E1A',
        paddingLeft: '20px',
        margin: '1.5em 0',
        fontStyle: 'italic',
        color: '#4A5C4A',
      }}
    >
      {children}
    </blockquote>
  )
}
