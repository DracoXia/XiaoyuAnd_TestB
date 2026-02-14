import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Quick validation tests
 * Run these first to verify basic functionality
 */
test.describe('Smoke Tests - 快速验证', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should display dashboard on load', async ({ page }) => {
    await page.goto('/');

    const greeting = page.locator('[class*="text-3xl"]');
    await expect(greeting).toBeVisible();

    const title = page.locator('text=/小屿和·香/');
    await expect(title).toBeVisible();
  });

  test('should have all scent cards visible', async ({ page }) => {
    await page.goto('/');

    const scents = ['听荷', '晚巷', '小院'];
    for (const scent of scents) {
      const scentElement = page.locator(`text=/${scent}/`);
      await expect(scentElement).toBeVisible();
    }
  });

  test('should be able to expand a scent card', async ({ page }) => {
    await page.goto('/');

    const tingheCard = page.locator('#scent-card-tinghe');
    await tingheCard.click();

    const igniteButton = page.locator('text=/点一支/');
    await expect(igniteButton).toBeVisible();
  });

  test('should navigate to immersion', async ({ page }) => {
    await page.goto('/');

    const tingheCard = page.locator('#scent-card-tinghe');
    await tingheCard.click();

    const igniteButton = page.locator('text=/点一支/');
    await igniteButton.click();

    const poem = page.locator('text=/荷塘无声/');
    await expect(poem).toBeVisible({ timeout: 10000 });
  });

  test('should have ambiance controls visible', async ({ page }) => {
    await page.goto('/');

    const tingheCard = page.locator('#scent-card-tinghe');
    await tingheCard.click();

    const igniteButton = page.locator('text=/点一支/');
    await igniteButton.click();

    await page.waitForTimeout(1000);

    const ambianceTuner = page.locator('.fixed.bottom-16');
    await expect(ambianceTuner).toBeVisible();
  });
});
