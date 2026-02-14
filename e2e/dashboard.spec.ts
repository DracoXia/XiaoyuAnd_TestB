import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';

/**
 * Dashboard E2E Tests
 * Tests for the scent selection dashboard
 */
test.describe('Dashboard - 香型选择页面', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test('should display greeting and title', async ({ page }) => {
    const greeting = await dashboardPage.getGreeting();
    expect(['早安', '午安', '晚安']).toContain(greeting);

    const title = page.locator('text=/小屿和·香/');
    await expect(title).toBeVisible();
  });

  test('should display all available scent cards', async () => {
    await dashboardPage.verifyScentCardsVisible();
  });

  test('should expand scent card on click', async ({ page }) => {
    await dashboardPage.expandScentCard('tinghe');

    // Verify card is expanded (contains ignite button)
    const igniteButton = page.locator('text=/点一支/');
    await expect(igniteButton).toBeVisible();

    // Verify expanded card shows story
    const storyText = page.locator('text=/制香师说/');
    await expect(storyText).toBeVisible();
  });

  test('should start session when clicking ignite button', async ({ page }) => {
    await dashboardPage.igniteScent('tinghe');

    // Should transition to immersion page
    const poem = page.locator('text=/荷塘无声/');
    await expect(poem).toBeVisible({ timeout: 10000 });
  });

  test('should display scent card details correctly', async ({ page }) => {
    const details = await dashboardPage.getScentCardDetails('tinghe');
    expect(details.name).toContain('听荷');
    expect(details.desc).toContain('清静');
  });

  test('should open and close mood map modal', async ({ page }) => {
    await dashboardPage.openMoodMap();

    // Verify modal content
    const calendarTitle = page.locator('text=/心情足迹/');
    await expect(calendarTitle).toBeVisible();

    await dashboardPage.closeMoodMap();
    // Verify modal is closed
    await expect(calendarTitle).not.toBeVisible();
  });

  test('should show calendar and recent tabs in mood map', async ({ page }) => {
    await dashboardPage.openMoodMap();

    // Check for tabs
    const calendarTab = page.locator('text=/心情日历/');
    const echoesTab = page.locator('text=/留下的光/');

    await expect(calendarTab).toBeVisible();
    await expect(echoesTab).toBeVisible();
  });

  test('should not allow clicking locked scent cards', async ({ page }) => {
    const lockedCard = page.locator('#scent-card-coming');
    await lockedCard.click();

    // Verify that the card does not expand
    const igniteButton = page.locator('text=/点一支/').filter({ hasText: /^点一支$/ });
    await expect(igniteButton).not.toBeVisible({ timeout: 2000 });
  });

  test('should switch between scents by clicking different cards', async ({ page }) => {
    // Select first scent
    await dashboardPage.expandScentCard('tinghe');
    let selectedCheckmark = page.locator('#scent-card-tinghe .lucide-check');
    await expect(selectedCheckmark).toBeVisible();

    // Select second scent
    await dashboardPage.expandScentCard('wanxiang');
    selectedCheckmark = page.locator('#scent-card-wanxiang .lucide-check');
    await expect(selectedCheckmark).toBeVisible();

    // First card should no longer have checkmark (collapsed)
    const firstCheckmark = page.locator('#scent-card-tinghe .lucide-check');
    await expect(firstCheckmark).not.toBeVisible({ timeout: 2000 });
  });
});
