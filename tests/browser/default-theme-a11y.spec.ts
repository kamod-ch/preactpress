import { expect, test } from "@playwright/test";

test.describe("default theme accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/guide/getting-started");
  });

  test("skip link focuses main content", async ({ page }) => {
    await page.waitForFunction(() => document.documentElement.classList.contains("pp-ready"));

    const skip = page.locator(".pp-skip-link");
    await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#content")).toBeFocused();
  });

  test("theme toggle stores preference on the document root", async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem("preactpress-theme"));

    const toggle = page.getByRole("button", { name: /toggle light and dark theme/i });
    await expect(toggle).toBeVisible();
    await toggle.click();

    const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme === "light" || theme === "dark").toBe(true);

    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDarkClass).toBe(theme === "dark");
  });

  test("desktop sidebar search filters pages", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    const search = page.locator(".pp-sidebar .pp-search input");
    await expect(search).toBeVisible();
    await search.fill("routing");

    const results = page.locator(".pp-sidebar .pp-search-results");
    await expect(results).toBeVisible();
    await expect(results).toContainText("Routing");
  });
});
