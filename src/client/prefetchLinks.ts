const PREFETCH_MARGIN = '200px'

function scheduleIdle(task: () => void): void {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => task(), { timeout: 2000 })
    return
  }
  setTimeout(task, 1)
}

export function setupViewportPrefetch(
  routeFromHref: (href: string) => string | undefined,
  prefetch: (route: string) => void
): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {}

  const seen = new WeakSet<HTMLAnchorElement>()
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const link = entry.target
        if (!(link instanceof HTMLAnchorElement) || seen.has(link)) continue
        const route = routeFromHref(link.href)
        if (!route) continue
        seen.add(link)
        scheduleIdle(() => prefetch(route))
        observer.unobserve(link)
      }
    },
    { rootMargin: PREFETCH_MARGIN }
  )

  const observe = (root: ParentNode): void => {
    for (const link of Array.from(root.querySelectorAll('a[href]'))) {
      if (link instanceof HTMLAnchorElement && !seen.has(link)) {
        observer.observe(link)
      }
    }
  }

  observe(document)
  const mutation = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of Array.from(record.addedNodes)) {
        if (node instanceof HTMLAnchorElement) {
          if (!seen.has(node)) observer.observe(node)
          continue
        }
        if (node instanceof Element) observe(node)
      }
    }
  })
  mutation.observe(document.body, { childList: true, subtree: true })

  return () => {
    observer.disconnect()
    mutation.disconnect()
  }
}
