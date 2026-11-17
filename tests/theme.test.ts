import { describe, expect, it } from "vitest";
import {
  applyTheme,
  PREACTPRESS_THEME_BOOT_SCRIPT,
  PREACTPRESS_THEME_STORAGE_KEY,
} from "../src/shared/theme.js";

function boot(options: {
  stored?: "light" | "dark" | null;
  dataTheme?: string | null;
  darkClass?: boolean;
  prefersDark?: boolean;
}) {
  const classes = new Set<string>(options.darkClass ? ["dark"] : []);
  const attributes = new Map<string, string>();
  if (options.dataTheme) attributes.set("data-theme", options.dataTheme);
  const root = {
    getAttribute: (name: string) => attributes.get(name) ?? null,
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    removeAttribute: (name: string) => attributes.delete(name),
    classList: {
      add: (name: string) => classes.add(name),
      toggle: (name: string, force?: boolean) => {
        const on = force ?? !classes.has(name);
        if (on) classes.add(name);
        else classes.delete(name);
        return on;
      },
      contains: (name: string) => classes.has(name),
    },
    style: { colorScheme: "" },
  };
  const storage = new Map<string, string>();
  if (options.stored) storage.set(PREACTPRESS_THEME_STORAGE_KEY, options.stored);
  const previous = {
    localStorage: globalThis.localStorage,
    document: globalThis.document,
    window: globalThis.window,
  };
  Object.assign(globalThis, {
    localStorage: { getItem: (key: string) => storage.get(key) ?? null },
    document: { documentElement: root },
    window: { matchMedia: () => ({ matches: options.prefersDark === true }) },
  });
  try {
    new Function(PREACTPRESS_THEME_BOOT_SCRIPT)();
  } finally {
    Object.assign(globalThis, previous);
  }
  return { theme: root.getAttribute("data-theme"), dark: classes.has("dark") };
}

describe("theme boot script", () => {
  it("references the storage key", () => {
    expect(PREACTPRESS_THEME_BOOT_SCRIPT).toContain(PREACTPRESS_THEME_STORAGE_KEY);
  });

  it("syncs data-theme and dark class before first paint", () => {
    expect(PREACTPRESS_THEME_BOOT_SCRIPT).toContain("setAttribute('data-theme'");
    expect(PREACTPRESS_THEME_BOOT_SCRIPT).toContain("classList.toggle('dark'");
    expect(PREACTPRESS_THEME_BOOT_SCRIPT).toContain("prefers-color-scheme: dark");
    expect(boot({ stored: "dark" })).toEqual({ theme: "dark", dark: true });
  });

  it("keeps a Kamod preset and still switches light and dark", () => {
    expect(boot({ stored: "light", dataTheme: "ocean", darkClass: true })).toEqual({
      theme: "ocean",
      dark: false,
    });
    expect(boot({ stored: "dark", dataTheme: "kamod" })).toEqual({
      theme: "kamod",
      dark: true,
    });
    const classes = new Set<string>(["dark"]);
    const root = {
      getAttribute: () => "kamod",
      setAttribute: () => {
        throw new Error("preset overwritten");
      },
      removeAttribute: () => {
        throw new Error("preset removed");
      },
      classList: {
        toggle: (_name: string, force?: boolean) => {
          if (force) classes.add("dark");
          else classes.delete("dark");
        },
      },
      style: { colorScheme: "dark" },
    };
    const previous = globalThis.document;
    Object.assign(globalThis, { document: { documentElement: root } });
    try {
      applyTheme("light");
      expect(classes.has("dark")).toBe(false);
      expect(root.style.colorScheme).toBe("light");
    } finally {
      Object.assign(globalThis, { document: previous });
    }
  });
});
