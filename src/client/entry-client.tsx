import { hydrate } from "preact";
import { App } from "./app.js";
import type { PageView } from "./types.js";
import { loadPage, seedPage } from "./loadPage.js";

function currentRoute(): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") || "";
  let p = window.location.pathname;
  if (base && p.startsWith(base)) p = p.slice(base.length) || "/";
  if (!p.startsWith("/")) p = `/${p}`;
  return (p.replace(/\/$/, "") || "/") as string;
}

const el = document.getElementById("app");
if (el) {
  void (async () => {
    const initial = el.getAttribute("data-preactpress-route") ?? currentRoute();
    const dataEl = document.getElementById("__PREACTPRESS_PAGE_DATA__");
    const initialPage = dataEl?.textContent
      ? (JSON.parse(dataEl.textContent) as PageView)
      : await loadPage(initial, import.meta.env.BASE_URL || "/");
    seedPage(initial, initialPage);
    hydrate(<App routePath={initial} initialPage={initialPage} />, el);
  })();
}
