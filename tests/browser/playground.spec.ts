import { expect, test } from "@playwright/test";

test.describe("playground plugin", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/examples/playground");
    await page.waitForFunction(() => document.documentElement.classList.contains("pp-ready"));
    await expect(page.locator(".pp-playground").first()).toBeVisible();
    await page.waitForTimeout(500);
  });

  test("renders interactive playground with live preview", async ({ page }) => {
    const playground = page.locator(".pp-playground").first();
    await expect(playground.locator(".pp-playground-editor")).toBeVisible();
    await expect(playground.locator(".pp-playground-preview-frame")).toBeVisible();
    await expect(
      page.frameLocator(".pp-playground-preview-frame").first().locator("button"),
    ).toContainText("Count:", { timeout: 15_000 });
  });

  test("updates preview when code changes", async ({ page }) => {
    const editor = page.locator(".pp-playground").first().locator(".pp-playground-editor");
    const nextSource = `import { useState } from "preact/hooks";

export default function Demo() {
  const [label] = useState("Hello playground");
  return <button type="button">{label}</button>;
}`;

    await editor.click();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.insertText(nextSource);

    await expect(
      page.frameLocator(".pp-playground-preview-frame").first().locator("button"),
    ).toHaveText("Hello playground", { timeout: 20_000 });
  });

  test("reset restores the initial example", async ({ page }) => {
    const root = page.locator(".pp-playground").first();
    const editor = root.locator(".pp-playground-editor");
    const preview = page.frameLocator(".pp-playground-preview-frame").first();

    await editor.click();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.insertText(`export default function Demo() {
  return <button type="button">Changed</button>
}`);
    await expect(preview.locator("button")).toHaveText("Changed", { timeout: 15_000 });

    await root.getByRole("button", { name: "Reset" }).click();
    await expect(preview.locator("button")).toContainText("Count:", { timeout: 15_000 });
  });

  test("shows file tabs for multi-file examples", async ({ page }) => {
    const multi = page.locator(".pp-playground").nth(1);
    await expect(multi.getByRole("tab", { name: "App.tsx" })).toBeVisible();
    await expect(multi.getByRole("tab", { name: "components.tsx" })).toBeVisible();
  });
});
