import type { FunctionalComponent } from 'preact'
import { useEffect } from 'preact/hooks'

const STORAGE_KEY = 'preactpress-theme' as const

type Stored = 'light' | 'dark'

function readStored(): Stored | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

function apply(theme: Stored | null): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === null) root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}

function toggle(): void {
  const stored = readStored()
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = stored === 'dark' || (stored === null && prefersDark)
  const next: Stored = isDark ? 'light' : 'dark'
  apply(next)
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* ignore */
  }
}

const ThemeToggle: FunctionalComponent = () => {
  useEffect(() => {
    function onStorage(e: StorageEvent): void {
      if (e.key !== STORAGE_KEY) return
      const v = e.newValue
      apply(v === 'light' || v === 'dark' ? v : null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <button type="button" class="mag-theme-toggle" onClick={toggle} aria-label="Hell- und Dunkelmodus wechseln">
      <span class="mag-theme-toggle-moon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      </span>
      <span class="mag-theme-toggle-sun" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
      </span>
    </button>
  )
}

export default ThemeToggle
