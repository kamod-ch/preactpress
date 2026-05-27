export const CONTENT_CHUNK_DIR = 'preactpress-content'

export function encodeContentRoute(route: string): string {
  if (route === '/') return '_index.json'
  const clean = route.replace(/^\/+|\/+$/g, '')
  return `${clean
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('__')}.json`
}

export function contentChunkPath(route: string): string {
  return `${CONTENT_CHUNK_DIR}/${encodeContentRoute(route)}`
}
