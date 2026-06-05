declare module 'markdown-it-emoji' {
  import type MarkdownIt from 'markdown-it'

  export function full(md: MarkdownIt, options?: Record<string, unknown>): void
  export function light(md: MarkdownIt, options?: Record<string, unknown>): void
  export function bare(md: MarkdownIt, options?: Record<string, unknown>): void
}

declare module 'markdown-it-mathjax3' {
  import type MarkdownIt from 'markdown-it'

  export default function mathjax(md: MarkdownIt): void
}
