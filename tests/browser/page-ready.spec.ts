import { expect, test } from "@playwright/test";

test.describe("page-ready stylesheet gate", () => {
  test("keeps the app hidden until a delayed initial stylesheet completes", async ({ page }) => {
    let releaseCss!: () => void;
    let stylesheetRequested = false;
    const cssReleased = new Promise<void>((resolve) => {
      releaseCss = resolve;
    });

    await page.route("**/assets/*.css", async (route) => {
      if (stylesheetRequested) {
        await route.continue();
        return;
      }

      stylesheetRequested = true;
      const response = await route.fetch();
      await cssReleased;
      await route.fulfill({ response });
    });

    const navigation = page.goto("/", { waitUntil: "load" });

    await expect
      .poll(() => stylesheetRequested, { message: "initial stylesheet was requested" })
      .toBe(true);
    await page.locator("#app").waitFor({ state: "attached" });
    await page.waitForTimeout(5500);

    await expect(page.locator("html")).not.toHaveClass(/pp-ready/);
    await expect(page.locator("#app")).toBeHidden();
    await expect(page.locator("#pp-preloader")).toBeVisible();

    releaseCss();
    await navigation;
    await page.waitForFunction(() => document.documentElement.classList.contains("pp-ready"));

    await expect(page.locator("#app")).toBeVisible();
    await expect(page.locator("#pp-preloader")).toBeHidden();
  });
});
