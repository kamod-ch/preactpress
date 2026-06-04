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
      tags?: string[]
      image?: string
      pageType?: 'website' | 'article'
      headings: { id: string; text: string; level: number }[]
      relativePath?: string
      lastUpdated?: string
    }
    | {
      kind: 'mdx'
      Component: ComponentType<{
        components?: Record<string, ComponentType<Record<string, unknown>>>
      }>
      meta: Record<string, unknown>
      title?: string
      description?: string
      tags?: string[]
      image?: string
      pageType?: 'website' | 'article'
      headings: { id: string; text: string; level: number }[]
      relativePath?: string
      lastUpdated?: string
    }
  >
  export const pagesMeta: Record<
    string,
    {
      kind: 'markdown' | 'mdx'
      meta: Record<string, unknown>
      title?: string
      description?: string
      tags?: string[]
      image?: string
      pageType?: 'website' | 'article'
      headings: { id: string; text: string; level: number }[]
      relativePath?: string
      lastUpdated?: string
    }
  >
  export const mdxLoaders: Record<
    string,
    () => Promise<{
      default: ComponentType<{
        components?: Record<string, ComponentType<Record<string, unknown>>>
      }>
    }>
  >
  export const routes: string[]
}

declare module 'virtual:preactpress-site' {
  export const site: {
    title: string
    description: string
    base: string
    lang: string
    url?: string
  }
  export const themeConfig: {
    logo?: string
    nav?: { text: string; link: string }[]
    sidebar?: { text?: string; items: { text: string; link: string }[] }[]
    outline?: boolean | import('../shared/pageChrome.js').PageOutlineConfig
    search?: boolean
    tags?: boolean
    footer?: string
    editLink?: { pattern: string; text?: string }
    lastUpdated?: boolean
  }
  export const i18n: import('../node/siteConfig.js').ResolvedI18n | undefined
}

declare module 'virtual:preactpress-layout' {
  import type { FunctionalComponent } from 'preact'
  import type { LayoutProps } from './types.js'
  const Layout: FunctionalComponent<LayoutProps>
  export default Layout
}
