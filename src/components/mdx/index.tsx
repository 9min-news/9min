import type { MDXComponents } from 'mdx/types'
import { Blockquote } from './Blockquote'
import { Chart } from './Chart'
import { PullQuote } from '../PullQuote'

// Component map passed to MDXRemote.
// Maps HTML element names → custom components (override)
// and custom component names → components (available in MDX).
export const mdxComponents: MDXComponents = {
  // Override default HTML elements
  blockquote: Blockquote,
  // Custom components available in MDX content
  PullQuote,
  Chart,
}
