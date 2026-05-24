import { test, expect } from "@playwright/test";

test.describe("Fix It Now customer app", () => {
  test("home page loads with branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/FixItNow/i);
    await expect(page.getByRole("button", { name: /login/i }).first()).toBeVisible();
  });

  test("booking section is reachable", async ({ page }) => {
    await page.goto("/#home");
    await expect(page.locator("#booking")).toBeAttached();
  });

  test("login modal opens from hash", async ({ page }) => {
    await page.goto("/#login");
    await expect(page.getByText(/welcome back/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});
