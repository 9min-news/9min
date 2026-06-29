import type { MDXComponents } from 'mdx/types'
import { Blockquote } from './Blockquote'
import { Chart } from './Chart'
import { PullQuote } from '../PullQuote'

function ExternalLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = href?.startsWith('http') || href?.startsWith('//')
  if (isExternal) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
  }
  return <a href={href} {...props}>{children}</a>
}

export const mdxComponents: MDXComponents = {
  blockquote: Blockquote,
  a: ExternalLink,
  PullQuote,
  Chart,
}
