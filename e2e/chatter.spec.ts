import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});

test("login page loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Login to Chatter")).toBeVisible();
});

test("search page loads", async ({ page }) => {
  await page.goto("/search");
  await expect(page.getByPlaceholder("Search posts or profiles...")).toBeVisible();
});

test("trending page loads", async ({ page }) => {
  await page.goto("/trending");
  await expect(page.getByText("Trending Posts")).toBeVisible();
});

test("protected editor redirects to login", async ({ page }) => {
  await page.goto("/editor");
  await expect(page).toHaveURL(/login/);
});

test("protected dashboard redirects to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/);
});

test("protected notifications redirects to login", async ({ page }) => {
  await page.goto("/notifications");
  await expect(page).toHaveURL(/login/);
});