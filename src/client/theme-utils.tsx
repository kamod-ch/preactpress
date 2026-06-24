import type { ComponentChildren, FunctionalComponent, JSX } from "preact";
import { useEffect } from "preact/hooks";
import {
  PREACTPRESS_THEME_STORAGE_KEY,
  applyTheme,
  readStoredTheme,
  type PreactpressStoredTheme,
} from "../shared/theme.js";
import { slugifySegment } from "../shared/slug.js";

export function withBase(base: string, link: string): string {
  if (
    /^(?:[a-z]+:)?\/\//i.test(link) ||
    /^(?:data|mailto|tel):/i.test(link) ||
    link.startsWith("#")
  ) {
    return link;
  }
  const b = base === "/" ? "" : base.replace(/\/$/, "");
  const l = link.startsWith("/") ? link : `/${link}`;
  return `${b}${l}`;
}

export function normalizeLink(link: string): string {
  const clean = link.split(/[?#]/, 1)[0] || "/";
  const prefixed = clean.startsWith("/") ? clean : `/${clean}`;
  return prefixed.replace(/\/$/, "") || "/";
}

export function isActive(routePath: string, link: string | undefined): boolean {
  if (!link || /^(?:[a-z]+:)?\/\//i.test(link)) return false;
  const route = normalizeLink(routePath);
  const target = normalizeLink(link);
  return route === target || (target !== "/" && route.startsWith(`${target}/`));
}

export function classNames(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(" ");
}

export function childText(children: ComponentChildren): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childText).join("");
  if (typeof children === "object" && "props" in children) {
    return childText(children.props.children as ComponentChildren);
  }
  return "";
}

export function slugifyHeading(text: string): string {
  return slugifySegment(text);
}

export interface MdxHeadingOptions {
  headingClass: string;
  anchorClass: string;
  anchorLabel: string;
}

export function createMdxHeadingComponents({
  headingClass,
  anchorClass,
  anchorLabel,
}: MdxHeadingOptions) {
  const used = new Map<string, number>();
  const heading =
    (Tag: "h2" | "h3") =>
    ({ children, ...props }: JSX.HTMLAttributes<HTMLHeadingElement>) => {
      const base = slugifyHeading(childText(children));
      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count + 1}`;
      return (
        <Tag {...props} id={id} class={`${headingClass} ${props.class ?? ""}`.trim()}>
          {children}
          <a class={anchorClass} href={`#${id}`} aria-label={anchorLabel}>
            #
          </a>
        </Tag>
      );
    };

  return {
    h2: heading("h2"),
    h3: heading("h3"),
  };
}

export function toggleStoredTheme(): void {
  const stored = readStoredTheme();
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = stored === "dark" || (stored === null && prefersDark);
  const next: PreactpressStoredTheme = isDark ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem(PREACTPRESS_THEME_STORAGE_KEY, next);
  } catch {
    /* ignore quota / private mode */
  }
}

export function useStoredThemeSync(): void {
  useEffect(() => {
    function syncTheme(event?: StorageEvent): void {
      if (event && event.key !== PREACTPRESS_THEME_STORAGE_KEY) return;
      const value =
        event?.newValue ??
        (() => {
          try {
            return localStorage.getItem(PREACTPRESS_THEME_STORAGE_KEY);
          } catch {
            return null;
          }
        })();
      applyTheme(value === "light" || value === "dark" ? value : null);
    }

    function onSystemThemeChange(): void {
      if (readStoredTheme() !== null) return;
      applyTheme(null);
    }

    syncTheme();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", onSystemThemeChange);
    window.addEventListener("storage", syncTheme);
    return () => {
      media.removeEventListener("change", onSystemThemeChange);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);
}

export interface ThemeToggleProps {
  className?: string;
  ariaLabel?: string;
}

export const ThemeToggle: FunctionalComponent<ThemeToggleProps> = ({
  className = "pp-theme-toggle",
  ariaLabel = "Toggle light and dark theme",
}) => {
  useStoredThemeSync();

  return (
    <button type="button" class={className} onClick={toggleStoredTheme} aria-label={ariaLabel}>
      <span class={`${className}-moon`} aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      </span>
      <span class={`${className}-sun`} aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
      </span>
    </button>
  );
};
