export const SCROLL_STATE_KEY = "ppScrollY";

let skipScrollRestoreOnce = false;

export function setupScrollRestoration(): () => void {
  if (typeof window === "undefined") return () => {};

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const onScroll = () => {
    persistScrollPosition();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pagehide", persistScrollPosition);
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pagehide", persistScrollPosition);
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

export async function restoreScrollPositionAfterLayout(): Promise<void> {
  await scrollAfterLayout(readScrollPositionFromHistory());
}

export async function scrollToTopAfterLayout(): Promise<void> {
  await scrollAfterLayout(0);
}

async function scrollAfterLayout(top: number): Promise<void> {
  if (typeof window === "undefined") return;
  await nextAnimationFrame();
  await nextAnimationFrame();
  await waitForImagesToSettle();
  await nextAnimationFrame();

  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo({ top, left: 0, behavior: "auto" });
  html.style.scrollBehavior = previous;
}

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForImagesToSettle(timeoutMs = 1500): Promise<void> {
  if (typeof document === "undefined") return;
  const images = Array.from(document.images).filter((image) => !image.complete);
  if (images.length === 0) return;

  await Promise.race([
    Promise.allSettled(
      images.map(
        (image) =>
          new Promise<void>((resolve) => {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          }),
      ),
    ),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
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
