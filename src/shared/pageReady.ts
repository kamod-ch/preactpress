import { escapeHtml } from "./escapeHtml.js";
import type { PageReadyConfig, ResolvedPageReadyConfig } from "../node/siteConfig.js";

const DEFAULT_PRELOADER = `<div id="pp-preloader" role="status" aria-live="polite" aria-label="Loading">
  <div class="pp-preloader-spinner" aria-hidden="true"></div>
</div>`;

const PAGE_READY_HEAD = `<style id="pp-page-ready">
  html:not(.pp-ready) #app {
    visibility: hidden;
  }
  html.pp-ready #pp-preloader {
    display: none !important;
  }
  :root,
  :root[data-theme="light"] {
    --pp-preloader-bg: #ffffff;
    --pp-preloader-track: #e5e7eb;
    --pp-preloader-accent: #171717;
  }
  :root[data-theme="dark"],
  html.dark {
    --pp-preloader-bg: #1b1b1f;
    --pp-preloader-track: #2f2f32;
    --pp-preloader-accent: rgba(255, 255, 245, 0.86);
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) {
      --pp-preloader-bg: #1b1b1f;
      --pp-preloader-track: #2f2f32;
      --pp-preloader-accent: rgba(255, 255, 245, 0.86);
    }
  }
  #pp-preloader {
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--pp-preloader-bg);
    color-scheme: light dark;
  }
  .pp-preloader-spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid var(--pp-preloader-track);
    border-top-color: var(--pp-preloader-accent);
    border-radius: 50%;
    animation: pp-preloader-spin 0.7s linear infinite;
    box-sizing: border-box;
  }
  @keyframes pp-preloader-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
<script>
  document.documentElement.setAttribute("aria-busy", "true");
</script>
<noscript>
  <style>
    #pp-preloader {
      display: none !important;
    }
    #app {
      visibility: visible !important;
    }
  </style>
</noscript>`;

function escapeJsString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function normalizePreloaderHtml(html: string): string {
  if (/id=["']pp-preloader["']/.test(html)) return html;
  return `<div id="pp-preloader" role="status" aria-live="polite" aria-label="Loading">${html}</div>`;
}

function buildThemeCssProbe(probe: string | false): string {
  if (probe === false) return "";
  const safeProbe = escapeJsString(probe);
  return `var probe = getComputedStyle(document.documentElement).getPropertyValue("${safeProbe}");
      if (probe && probe.trim() !== "") return true;

      `;
}

function buildPageReadyBootScript(config: ResolvedPageReadyConfig): string {
  const themeProbe = buildThemeCssProbe(config.probe);
  return `<script>
  (function () {
    var READY_CLASS = "pp-ready";
    var FALLBACK_MS = ${config.fallbackMs};
    var MAX_FRAMES = ${config.maxFrames};
    var STABLE_FRAMES = ${config.stableFrames};

    function markReady() {
      if (document.documentElement.classList.contains(READY_CLASS)) return;
      document.documentElement.classList.add(READY_CLASS);
      document.documentElement.removeAttribute("aria-busy");
    }

    function themeCssApplied() {
      ${themeProbe}var links = document.querySelectorAll('link[rel="stylesheet"][href]');
      if (!links.length) return true;

      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (link.media === "print") return false;
        try {
          if (!link.sheet) return false;
        } catch (e) {
          return false;
        }
      }
      return true;
    }

    function whenStylesReady() {
      return new Promise(function (resolve) {
        var settled = false;
        var lastResourceCount = -1;
        var stableFrames = 0;

        function resourceCount() {
          return (
            document.querySelectorAll('link[rel="stylesheet"][href]').length +
            document.querySelectorAll("style:not(#pp-page-ready)").length
          );
        }

        function settle() {
          if (settled) return;
          if (!themeCssApplied()) return;
          var count = resourceCount();
          if (count !== lastResourceCount) {
            lastResourceCount = count;
            stableFrames = 0;
            return;
          }
          stableFrames += 1;
          if (stableFrames < STABLE_FRAMES) return;
          settled = true;
          observer.disconnect();
          var app = document.getElementById("app");
          if (app) void app.offsetHeight;
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              requestAnimationFrame(resolve);
            });
          });
        }

        var observer = new MutationObserver(settle);
        observer.observe(document.head, { childList: true, subtree: true });

        var links = document.querySelectorAll('link[rel="stylesheet"][href]');
        for (var i = 0; i < links.length; i++) {
          links[i].addEventListener("load", settle);
          links[i].addEventListener("error", settle);
        }

        var frames = 0;
        function poll() {
          settle();
          if (settled) return;
          frames += 1;
          if (frames >= MAX_FRAMES) {
            settled = true;
            observer.disconnect();
            resolve();
            return;
          }
          requestAnimationFrame(poll);
        }
        poll();
      });
    }

    function start() {
      whenStylesReady().then(markReady);
      setTimeout(markReady, FALLBACK_MS);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  })();
</script>`;
}

export function resolvePageReadyConfig(
  input: false | PageReadyConfig | undefined,
): ResolvedPageReadyConfig | false {
  if (input === false) return false;
  const opts = input ?? {};
  return {
    preloader: normalizePreloaderHtml(opts.preloader ?? DEFAULT_PRELOADER),
    fallbackMs: opts.fallbackMs ?? 5000,
    probe: opts.probe === false ? false : (opts.probe ?? "--pp-bg"),
    stableFrames: opts.stableFrames ?? 4,
    maxFrames: opts.maxFrames ?? 300,
  };
}

/** Render-blocking stylesheet link (ensures CSS applies before #app is revealed). */
export function renderStylesheetLink(href: string, opts: { crossorigin?: boolean } = {}): string {
  const safeHref = escapeHtml(href);
  const cross = opts.crossorigin ? ' crossorigin="anonymous"' : "";
  return `<link rel="stylesheet" href="${safeHref}"${cross}>`;
}

export function renderStylesheetLinks(
  hrefs: string[],
  opts: { crossorigin?: boolean } = {},
): string {
  return hrefs.map((href) => renderStylesheetLink(href, opts)).join("\n    ");
}

/** @deprecated Use renderStylesheetLink — async CSS caused FOUC when revealing #app. */
export function renderNonBlockingStylesheetLink(
  href: string,
  opts: { crossorigin?: boolean } = {},
): string {
  return renderStylesheetLink(href, opts);
}

export function renderNonBlockingStylesheetLinks(
  hrefs: string[],
  opts: { crossorigin?: boolean } = {},
): string {
  return renderStylesheetLinks(hrefs, opts);
}

/** Inject inline preloader shell so first paint shows a spinner until stylesheets are ready. */
export function injectPageReadyShell(
  html: string,
  pageReady: ResolvedPageReadyConfig | false = resolvePageReadyConfig(undefined),
): string {
  if (pageReady === false) return html;
  if (html.includes('id="pp-page-ready"')) return html;

  const bootScript = buildPageReadyBootScript(pageReady);

  let out = html.replace(/<head>/i, `<head>\n    ${PAGE_READY_HEAD}\n`);

  out = out.replace(/<body([^>]*)>/i, `<body$1>\n    ${pageReady.preloader}\n`);

  return out.replace(/<\/body>/i, `    ${bootScript}\n  </body>`);
}
