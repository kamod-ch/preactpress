export const SCROLL_STATE_KEY = "ppScrollY";

let skipScrollRestoreOnce = false;

export function setupScrollRestoration(): () => void {
  if (typeof window === "undefined") return () => {};

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;
  const onScroll = () => {
    clearTimeout(timeout);
    timeout = setTimeout(persistScrollPosition, 150);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    window.removeEventListener("scroll", onScroll);
    clearTimeout(timeout);
  };
}

export function persistScrollPosition(): void {
  if (typeof window === "undefined") return;
  const scrollY = window.scrollY;
  const state = window.history.state ?? {};
  if (state[SCROLL_STATE_KEY] === scrollY) return;
  window.history.replaceState({ ...state, [SCROLL_STATE_KEY]: scrollY }, "");
}

export function saveScrollPositionBeforeNavigation(): void {
  persistScrollPosition();
}

export function readScrollPositionFromHistory(): number {
  if (typeof window === "undefined") return 0;
  const scrollY = window.history.state?.[SCROLL_STATE_KEY];
  return typeof scrollY === "number" && Number.isFinite(scrollY) ? scrollY : 0;
}

export function restoreScrollPosition(): void {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: readScrollPositionFromHistory(), left: 0, behavior: "auto" });
}

export function restoreScrollPositionAfterLayout(): void {
  if (typeof window === "undefined") return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const html = document.documentElement;
      const previous = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      restoreScrollPosition();
      html.style.scrollBehavior = previous;
    });
  });
}

export function skipNextScrollRestore(): void {
  skipScrollRestoreOnce = true;
}

export function consumeScrollRestoreOnPopstate(): boolean {
  if (skipScrollRestoreOnce) {
    skipScrollRestoreOnce = false;
    return false;
  }
  return true;
}
