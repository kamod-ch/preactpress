import type { FunctionalComponent } from 'preact'
import { useEffect } from 'preact/hooks'

const THEME_STORAGE_KEY = 'preactpress-theme'
type StoredTheme = 'light' | 'dark'

function readStoredTheme(): StoredTheme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function applyTheme(theme: StoredTheme | null): void {
  if (theme === null) document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', theme)
}

function toggleTheme(): void {
  const stored = readStoredTheme()
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = stored === 'dark' || (stored === null && prefersDark)
  const next: StoredTheme = isDark ? 'light' : 'dark'
  applyTheme(next)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next)
  } catch {
    /* Ignore private mode or storage quota failures. */
  }
}

const ThemeToggle: FunctionalComponent = () => {
  useEffect(() => {
    function onStorage(event: StorageEvent): void {
      if (event.key !== THEME_STORAGE_KEY) return
      const value = event.newValue
      applyTheme(value === 'light' || value === 'dark' ? value : null)
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <button type="button" class="hn-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      <span class="hn-theme-toggle-moon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
          <path
            d="M21 14.8A8.5 8.5 0 0 1 9.2 3a7 7 0 1 0 11.8 11.8Z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      </span>
      <span class="hn-theme-toggle-sun" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="3.5" strokeWidth="1.7" />
          <path
            d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
        </svg>
      </span>
    </button>
  )
}

export default ThemeToggle
