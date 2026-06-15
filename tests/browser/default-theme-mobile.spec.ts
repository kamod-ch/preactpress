import { expect, test } from "@playwright/test";

test.describe("default theme mobile navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/guide/getting-started");
  });

  test("opens the drawer, traps focus, restores focus, and searches pages", async ({ page }) => {
    const menuButton = page.locator(".pp-menu-toggle");
    const drawer = page.locator("#pp-mobile-drawer");

    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(drawer).toHaveAttribute("aria-hidden", "true");

    await menuButton.click();

    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(drawer).toHaveAttribute("aria-hidden", "false");
    await expect(drawer.locator(".pp-mobile-close")).toBeFocused();

    const search = drawer.getByRole("searchbox", { name: "Search" });
    await search.fill("routing");
    const results = drawer.getByRole("listbox", { name: "Search results" });
    await expect(results).toBeVisible();
    await expect(results).toContainText("Routing");

    await page.keyboard.press("Escape");

    await expect(drawer).toHaveAttribute("aria-hidden", "true");
    await expect(menuButton).toBeFocused();
  });
});
