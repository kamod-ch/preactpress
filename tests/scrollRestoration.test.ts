import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  SCROLL_STATE_KEY,
  consumeScrollRestoreOnPopstate,
  persistScrollPosition,
  readScrollPositionFromHistory,
  restoreScrollPosition,
  saveScrollPositionBeforeNavigation,
  setupScrollRestoration,
  skipNextScrollRestore,
} from "../src/shared/scrollRestoration.js";

function createHistory(initialState: Record<string, unknown> = {}) {
  let state = initialState;
  return {
    scrollRestoration: "auto" as ScrollRestoration,
    replaceState(nextState: Record<string, unknown>) {
      state = nextState;
    },
    get state() {
      return state;
    },
  };
}

describe("scrollRestoration", () => {
  let scrollY = 0;
  let history: ReturnType<typeof createHistory>;
  let scrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollY = 0;
    history = createHistory({});
    scrollTo = vi.fn();
    vi.stubGlobal("window", {
      scrollY,
      history,
      scrollTo,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    Object.defineProperty(globalThis.window, "scrollY", {
      configurable: true,
      get: () => scrollY,
      set: (value: number) => {
        scrollY = value;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("setupScrollRestoration sets manual scroll restoration", () => {
    const cleanup = setupScrollRestoration();
    expect(history.scrollRestoration).toBe("manual");
    cleanup();
  });

  test("persistScrollPosition stores scrollY in history state", () => {
    scrollY = 420;
    persistScrollPosition();
    expect(history.state?.[SCROLL_STATE_KEY]).toBe(420);
  });

  test("saveScrollPositionBeforeNavigation persists current scroll position", () => {
    scrollY = 128;
    saveScrollPositionBeforeNavigation();
    expect(readScrollPositionFromHistory()).toBe(128);
  });

  test("restoreScrollPosition scrolls to stored position", () => {
    history.replaceState({ [SCROLL_STATE_KEY]: 256 });
    restoreScrollPosition();
    expect(scrollTo).toHaveBeenCalledWith({ top: 256, left: 0, behavior: "auto" });
  });

  test("skipNextScrollRestore suppresses one popstate restore", () => {
    skipNextScrollRestore();
    expect(consumeScrollRestoreOnPopstate()).toBe(false);
    expect(consumeScrollRestoreOnPopstate()).toBe(true);
  });
});
