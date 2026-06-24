import { describe, expect, it } from "vitest";
import {
  PREACTPRESS_THEME_BOOT_SCRIPT,
  PREACTPRESS_THEME_STORAGE_KEY,
} from "../src/shared/theme.js";

describe("theme boot script", () => {
  it("references the storage key", () => {
    expect(PREACTPRESS_THEME_BOOT_SCRIPT).toContain(PREACTPRESS_THEME_STORAGE_KEY);
  });

  it("syncs data-theme and dark class before first paint", () => {
    expect(PREACTPRESS_THEME_BOOT_SCRIPT).toContain("setAttribute('data-theme'");
    expect(PREACTPRESS_THEME_BOOT_SCRIPT).toContain("classList.toggle('dark'");
    expect(PREACTPRESS_THEME_BOOT_SCRIPT).toContain("prefers-color-scheme: dark");
  });
});
