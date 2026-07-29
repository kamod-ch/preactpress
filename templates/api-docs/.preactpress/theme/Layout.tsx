import type { FunctionalComponent } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  createMdxHeadingComponents,
  isActive,
  normalizeLink,
  withBase,
  type LayoutProps,
} from "@kamod-ch/preactpress/client";
import DocCardGrid, { type DocCard } from "./DocCardGrid.js";
import Logo from "./Logo.js";
import SearchBar from "./SearchBar.js";
import SidebarNav, { type SidebarGroup, type SidebarItem } from "./SidebarNav.js";
import SignInButton from "./SignInButton.js";
import ThemeToggle from "./ThemeToggle.js";
import "./protocol.css";

function resolveSidebar(
  sidebar: LayoutProps["themeConfig"]["sidebar"],
  routePath: string,
): SidebarGroup[] {
  if (!sidebar) return [];
  if (Array.isArray(sidebar)) return sidebar;

  const route = normalizeLink(routePath);
  const entries = Object.entries(sidebar)
    .map(([prefix, groups]) => ({ prefix: normalizeLink(prefix), groups }))
    .filter(({ prefix }) => prefix !== "/")
    .sort((a, b) => b.prefix.length - a.prefix.length);

  for (const { prefix, groups } of entries) {
    if (route === prefix || route.startsWith(`${prefix}/`)) return groups;
  }

  return sidebar["/"] ?? sidebar[""] ?? [];
}

function flattenItems(items: SidebarItem[]): Array<{ text: string; link: string }> {
  const out: Array<{ text: string; link: string }> = [];
  for (const item of items) {
    if (item.link) out.push({ text: item.text, link: item.link });
    if (item.items?.length) out.push(...flattenItems(item.items));
  }
  return out;
}

function isHomeRoute(routePath: string, prefix: string | undefined): boolean {
  return normalizeLink(routePath) === normalizeLink(prefix || "/");
}

function parseCards(value: unknown): DocCard[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title : undefined;
      const details = typeof record.details === "string" ? record.details : undefined;
      const link = typeof record.link === "string" ? record.link : undefined;
      if (!title || !details || !link) return null;
      return {
        title,
        details,
        link,
        linkText: typeof record.linkText === "string" ? record.linkText : undefined,
      };
    })
    .filter((card): card is DocCard => Boolean(card));
}

function parseHero(meta: Record<string, unknown> | undefined) {
  const hero = meta?.hero;
  if (!hero || typeof hero !== "object") return undefined;
  const record = hero as Record<string, unknown>;
  const actions = Array.isArray(record.actions)
    ? record.actions
        .map((action) => {
          if (!action || typeof action !== "object") return null;
          const item = action as Record<string, unknown>;
          const text = typeof item.text === "string" ? item.text : undefined;
          const link = typeof item.link === "string" ? item.link : undefined;
          const theme = item.theme === "alt" ? "alt" : "brand";
          if (!text || !link) return null;
          return { text, link, theme };
        })
        .filter((action): action is { text: string; link: string; theme: "brand" | "alt" } =>
          Boolean(action),
        )
    : [];
  return {
    text: typeof record.text === "string" ? record.text : undefined,
    tagline: typeof record.tagline === "string" ? record.tagline : undefined,
    actions,
  };
}

const Layout: FunctionalComponent<LayoutProps> = ({
  site,
  themeConfig,
  routePath,
  page,
  locale,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string | undefined>();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const isHome = isHomeRoute(routePath, locale?.prefix);
  const activeSidebar = resolveSidebar(themeConfig.sidebar, routePath);
  const sidebarItems = flattenItems(activeSidebar.flatMap((group) => group.items));
  const activeIndex = sidebarItems.findIndex((item) => isActive(routePath, item.link));
  const previous = activeIndex > 0 ? sidebarItems[activeIndex - 1] : undefined;
  const next =
    activeIndex >= 0 && activeIndex < sidebarItems.length - 1
      ? sidebarItems[activeIndex + 1]
      : undefined;

  const meta = (page?.meta ?? {}) as Record<string, unknown>;
  const hero = parseHero(meta);
  const guideCards = parseCards(meta.guideCards);
  const resourceCards = parseCards(meta.resourceCards);
  const outlineEnabled = themeConfig.outline !== false && !isHome;
  const outlineItems = outlineEnabled
    ? (page?.headings ?? []).filter((h) => h.level >= 2 && h.level <= 3)
    : [];
  const showOutline = outlineItems.length > 0;

  const mdxComponents = useMemo(
    () =>
      createMdxHeadingComponents({
        headingClass: "protocol-heading",
        anchorClass: "protocol-heading-anchor",
        anchorLabel: "Link to section",
      }),
    [],
  );
  const MdxComponent = page?.kind === "mdx" ? page.Component : undefined;

  const editHref =
    themeConfig.editLink && page?.relativePath
      ? themeConfig.editLink.pattern.replace(/:path/g, page.relativePath)
      : undefined;
  const lastUpdated = page?.lastUpdated
    ? new Date(page.lastUpdated).toLocaleDateString(site.lang || "en", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : undefined;

  const closeMobile = (restoreFocus = true) => {
    setMobileOpen(false);
    if (restoreFocus) requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [routePath]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobile();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!showOutline || !outlineItems.length) {
      setActiveHeading(undefined);
      return;
    }
    const update = () => {
      const visible = outlineItems
        .map((heading) => document.getElementById(heading.id))
        .filter((el): el is HTMLElement => Boolean(el))
        .filter((el) => el.getBoundingClientRect().top <= 96);
      setActiveHeading(visible.at(-1)?.id ?? outlineItems[0]?.id);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [outlineItems, showOutline]);

  const markdownBody =
    page?.kind === "markdown" ? (
      <div
        class={isHome ? "protocol-getting-started" : "protocol-doc-content"}
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    ) : MdxComponent ? (
      <div class="protocol-doc-content">
        <MdxComponent components={mdxComponents} />
      </div>
    ) : null;

  const sidebarContent = (
    <SidebarNav groups={activeSidebar} routePath={routePath} base={site.base} />
  );

  return (
    <div class={`protocol-site${isHome ? " is-home" : ""}`}>
      <a class="protocol-skip" href="#content">
        Skip to content
      </a>

      <header class="protocol-header">
        <div class="protocol-header-inner">
          <a
            class="protocol-brand"
            href={withBase(site.base, locale?.prefix || "/")}
            aria-label={site.title}
          >
            <Logo label={site.title} />
          </a>

          <SearchBar base={site.base} enabled={Boolean(themeConfig.search)} />

          <div class="protocol-header-actions">
            <nav class="protocol-nav" aria-label="Main navigation">
              {(themeConfig.nav ?? []).map((item) =>
                item.link ? (
                  <a
                    key={item.link}
                    class={isActive(routePath, item.link) ? "active" : ""}
                    href={withBase(site.base, item.link)}
                    aria-current={isActive(routePath, item.link) ? "page" : undefined}
                  >
                    {item.text}
                  </a>
                ) : null,
              )}
            </nav>
            <ThemeToggle />
            <SignInButton signIn={themeConfig.signInLink} base={site.base} />
            <button
              type="button"
              class="protocol-menu-btn"
              ref={menuButtonRef}
              aria-expanded={mobileOpen}
              aria-controls="protocol-mobile-nav"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <div
        class={`protocol-drawer-backdrop${mobileOpen ? " open" : ""}`}
        onClick={() => closeMobile(false)}
        aria-hidden="true"
      />
      <aside
        id="protocol-mobile-nav"
        class={`protocol-drawer${mobileOpen ? " open" : ""}`}
        ref={drawerRef}
        aria-label="Mobile documentation navigation"
        aria-hidden={!mobileOpen}
      >
        <div class="protocol-drawer-header">
          <Logo label={site.title} />
          <button
            type="button"
            class="protocol-drawer-close"
            aria-label="Close menu"
            onClick={() => closeMobile()}
          >
            ✕
          </button>
        </div>
        <nav
          class="protocol-nav"
          aria-label="Main navigation"
          style={{ display: "flex", flexDirection: "column", marginBottom: "1rem" }}
        >
          {(themeConfig.nav ?? []).map((item) =>
            item.link ? (
              <a
                key={item.link}
                href={withBase(site.base, item.link)}
                onClick={() => closeMobile(false)}
              >
                {item.text}
              </a>
            ) : null,
          )}
        </nav>
        {sidebarContent}
      </aside>

      <div class={`protocol-shell${showOutline ? " has-outline" : ""}`}>
        <aside class="protocol-sidebar" aria-label="Documentation navigation">
          {sidebarContent}
        </aside>

        <main id="content" class="protocol-main">
          {isHome ? (
            <>
              {hero ? (
                <section class="protocol-hero">
                  {hero.text ? <h1>{hero.text}</h1> : null}
                  {hero.tagline ? <p class="protocol-hero-tagline">{hero.tagline}</p> : null}
                  {hero.actions.length > 0 ? (
                    <div class="protocol-hero-actions">
                      {hero.actions.map((action) => (
                        <a
                          key={`${action.text}:${action.link}`}
                          class={`protocol-action protocol-action-${action.theme}`}
                          href={withBase(site.base, action.link)}
                        >
                          {action.text}
                          {action.theme === "brand" ? " →" : null}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}
              {markdownBody}
              <DocCardGrid title="Guides" cards={guideCards} base={site.base} />
              <DocCardGrid title="Resources" cards={resourceCards} base={site.base} />
            </>
          ) : (
            <article>
              <h1 class="protocol-doc-title">{page?.title ?? site.title}</h1>
              {page?.description ? <p class="protocol-doc-lead">{page.description}</p> : null}
              {markdownBody}
              {previous || next ? (
                <nav class="protocol-pager" aria-label="Page navigation">
                  {previous ? (
                    <a class="previous" href={withBase(site.base, previous.link)}>
                      <span>Previous</span>
                      {previous.text}
                    </a>
                  ) : (
                    <span />
                  )}
                  {next ? (
                    <a class="next" href={withBase(site.base, next.link)}>
                      <span>Next</span>
                      {next.text}
                    </a>
                  ) : null}
                </nav>
              ) : null}
              {themeConfig.lastUpdated || editHref ? (
                <footer class="protocol-doc-meta">
                  {themeConfig.lastUpdated && lastUpdated ? (
                    <span>Updated {lastUpdated}</span>
                  ) : null}
                  {editHref ? (
                    <span>
                      {themeConfig.lastUpdated && lastUpdated ? " · " : null}
                      <a href={editHref}>{themeConfig.editLink?.text ?? "Edit this page"}</a>
                    </span>
                  ) : null}
                </footer>
              ) : null}
            </article>
          )}
        </main>

        {showOutline ? (
          <aside class="protocol-outline" aria-label="On this page">
            <h2>On this page</h2>
            <ul>
              {outlineItems.map((heading) => (
                <li key={heading.id} class={`level-${heading.level}`}>
                  <a class={activeHeading === heading.id ? "active" : ""} href={`#${heading.id}`}>
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>

      {themeConfig.footer ? <footer class="protocol-footer">{themeConfig.footer}</footer> : null}
    </div>
  );
};

export default Layout;
