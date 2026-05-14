/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType } from 'preact'
  const MdxPage: ComponentType<{
    components?: Record<string, ComponentType<Record<string, unknown>>>
  }>
  export default MdxPage
}

declare module 'virtual:preactpress-pages' {
  import type { ComponentType } from 'preact'

  export const pages: Record<
    string,
    | {
      kind: 'markdown'
      meta: Record<string, unknown>
      html: string
      title?: string
      description?: string
      headings: { id: string; text: string; level: number }[]
    }
    | {
      kind: 'mdx'
      Component: ComponentType<{
        components?: Record<string, ComponentType<Record<string, unknown>>>
      }>
      meta: Record<string, unknown>
      title?: string
      description?: string
      headings: { id: string; text: string; level: number }[]
    }
  >
}

declare module 'virtual:preactpress-site' {
  export const site: {
    title: string
    description: string
    base: string
  }
  export const themeConfig: {
    nav?: { text: string; link: string }[]
    sidebar?: { text?: string; items: { text: string; link: string }[] }[]
    outline?: boolean
  }
}

declare module 'virtual:preactpress-layout' {
  import type { FunctionalComponent } from 'preact'
  import type { LayoutProps } from './types.js'
  const Layout: FunctionalComponent<LayoutProps>
  export default Layout
}
