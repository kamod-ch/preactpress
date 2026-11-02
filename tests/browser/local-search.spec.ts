import { expect, test } from "@playwright/test";

test("local fallback supports keyboard navigation, base paths and empty results", async ({
  page,
}) => {
  const indexRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("preactpress-search.json")) indexRequests.push(request.url());
  });
  await page.goto("/manual/guide/getting-started");
  await page.waitForFunction(() => document.documentElement.classList.contains("pp-ready"));
  const input = page.locator(".pp-sidebar input[type=search]");
  // Reach the field using only Tab from the initial document focus.
  for (let i = 0; i < 30 && !(await input.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  await expect(input).toBeFocused();
  await page.keyboard.type("routng");
  const result = page.locator(".pp-sidebar .pp-search-results a").first();
  await expect(result).toContainText("Routing");
  await expect(result).toHaveAttribute("href", "/manual/guide/routing");
  await page.keyboard.press("Tab");
  await expect(result).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/manual\/guide\/routing$/);
  await expect(page.locator("main h1#routing")).toContainText("Routing");
  await input.fill("zzznomatch");
  await expect(page.locator(".pp-sidebar .pp-search-results")).toHaveCount(0);
  await expect(page.locator(".pp-sidebar [role=status]")).toHaveText(/Search results: 0/i);
  expect(indexRequests).toEqual(["http://127.0.0.1:4175/manual/preactpress-search.json"]);
});
