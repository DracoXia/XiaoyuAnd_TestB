import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { ImmersionPage } from './pages/ImmersionPage';

/**
 * Playlist Import E2E Tests
 * Tests for the user playlist import functionality
 */
test.describe('Playlist Import - 歌单导入功能', () => {
  let immersionPage: ImmersionPage;

  test.beforeEach(async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await dashboardPage.igniteScent('tinghe');

    immersionPage = new ImmersionPage(page);
    await immersionPage.waitForVisible();
  });

  test('should display add playlist button (+) on immersion page', async () => {
    await expect(immersionPage.addPlaylistButton).toBeVisible();
  });

  test('should open playlist modal when clicking + button', async ({ page }) => {
    await immersionPage.openPlaylistModal();

    // Should show welcome title
    const welcomeTitle = page.locator('text=/喜欢的音乐|疗愈时光/');
    await expect(welcomeTitle).toBeVisible();
  });

  test('should show platform selection after clicking "开始设置"', async ({ page }) => {
    await immersionPage.openPlaylistModal();

    // Click start button
    const startButton = page.getByRole('button', { name: /开始设置/ });
    await startButton.click();

    // Should show platform options
    await expect(page.getByText('网易云音乐')).toBeVisible();
    await expect(page.getByText('Apple Music')).toBeVisible();
    await expect(page.getByText('小屿和音乐库')).toBeVisible();
  });

  test('should show Coming Soon for 小屿和音乐库', async ({ page }) => {
    await immersionPage.openPlaylistModal();
    await page.getByRole('button', { name: /开始设置/ }).click();

    // 小屿和音乐库 should show Coming Soon
    const xiaoyuOption = page.locator('button').filter({ hasText: '小屿和音乐库' });
    await expect(xiaoyuOption).toContainText(/Coming Soon|敬请期待/);
  });

  test('should show link input after selecting 网易云音乐', async ({ page }) => {
    await immersionPage.openPlaylistModal();
    await page.getByRole('button', { name: /开始设置/ }).click();

    // Select 网易云音乐
    await page.getByText('网易云音乐').click();

    // Should show link input
    const linkInput = page.getByPlaceholder(/链接/);
    await expect(linkInput).toBeVisible();

    // Should show help text
    await expect(page.getByText(/如何获取/)).toBeVisible();
  });

  test('should show error for invalid link', async ({ page }) => {
    await immersionPage.openPlaylistModal();
    await page.getByRole('button', { name: /开始设置/ }).click();
    await page.getByText('网易云音乐').click();

    // Enter invalid link
    await page.getByPlaceholder(/链接/).fill('https://invalid-link.com');
    await page.getByRole('button', { name: /导入歌单/ }).click();

    // Should show error message
    await expect(page.getByText(/不支持|无效|失败/)).toBeVisible();
  });

  test('should accept valid Netease Cloud Music link', async ({ page }) => {
    await immersionPage.openPlaylistModal();
    await page.getByRole('button', { name: /开始设置/ }).click();
    await page.getByText('网易云音乐').click();

    // Enter valid link
    const validLink = 'https://music.163.com/#/playlist?id=123456789';
    await page.getByPlaceholder(/链接/).fill(validLink);
    await page.getByRole('button', { name: /导入歌单/ }).click();

    // Should show success page
    await expect(page.getByText(/已导入|成功/)).toBeVisible({ timeout: 5000 });
  });

  test('should show "我的" mode button after importing playlist', async ({ page }) => {
    // Import a playlist first
    await immersionPage.openPlaylistModal();
    await page.getByRole('button', { name: /开始设置/ }).click();
    await page.getByText('网易云音乐').click();

    const validLink = 'https://music.163.com/#/playlist?id=123456789';
    await page.getByPlaceholder(/链接/).fill(validLink);
    await page.getByRole('button', { name: /导入歌单/ }).click();

    // Complete the import
    await page.getByRole('button', { name: /完成/ }).click();

    // "我的" button should now be visible
    const mineButton = page.locator('[class*="py-3 rounded-full"]').filter({ hasText: '我的' });
    await expect(mineButton).toBeVisible();
  });

  test('should highlight + button after playlist is set', async ({ page }) => {
    // Import a playlist
    await immersionPage.openPlaylistModal();
    await page.getByRole('button', { name: /开始设置/ }).click();
    await page.getByText('网易云音乐').click();

    await page.getByPlaceholder(/链接/).fill('https://music.163.com/#/playlist?id=123456789');
    await page.getByRole('button', { name: /导入歌单/ }).click();
    await page.getByRole('button', { name: /完成/ }).click();

    // + button should have orange highlight
    const addButton = immersionPage.addPlaylistButton;
    await expect(addButton).toHaveClass(/dopamine-orange/);
  });

  test('should be able to close modal with "稍后再说"', async ({ page }) => {
    await immersionPage.openPlaylistModal();

    // Click "稍后再说"
    await page.getByRole('button', { name: /稍后再说/ }).click();

    // Modal should be closed
    await expect(page.getByText(/喜欢的音乐/)).not.toBeVisible();
  });

  test('should be able to go back from platform selection', async ({ page }) => {
    await immersionPage.openPlaylistModal();
    await page.getByRole('button', { name: /开始设置/ }).click();

    // Click back button
    const backButton = page.locator('button').filter({ has: page.locator('.lucide-arrow-left') });
    await backButton.click();

    // Should be back to welcome page
    await expect(page.getByRole('button', { name: /开始设置/ })).toBeVisible();
  });

  test('should be able to go back from link input', async ({ page }) => {
    await immersionPage.openPlaylistModal();
    await page.getByRole('button', { name: /开始设置/ }).click();
    await page.getByText('网易云音乐').click();

    // Click back button
    const backButton = page.locator('button').filter({ has: page.locator('.lucide-arrow-left') });
    await backButton.click();

    // Should be back to platform selection
    await expect(page.getByText('Apple Music')).toBeVisible();
  });

  test('should accept Apple Music link', async ({ page }) => {
    await immersionPage.openPlaylistModal();
    await page.getByRole('button', { name: /开始设置/ }).click();
    await page.getByText('Apple Music').click();

    // Enter valid Apple Music link
    const validLink = 'https://music.apple.com/us/playlist/my-playlist/pl.abc123def456';
    await page.getByPlaceholder(/链接/).fill(validLink);
    await page.getByRole('button', { name: /导入歌单/ }).click();

    // Should show success page
    await expect(page.getByText(/已导入|成功/)).toBeVisible({ timeout: 5000 });
  });

  test('should persist playlist after page reload', async ({ page }) => {
    // Import a playlist
    await immersionPage.openPlaylistModal();
    await page.getByRole('button', { name: /开始设置/ }).click();
    await page.getByText('网易云音乐').click();

    await page.getByPlaceholder(/链接/).fill('https://music.163.com/#/playlist?id=999888777');
    await page.getByRole('button', { name: /导入歌单/ }).click();
    await page.getByRole('button', { name: /完成/ }).click();

    // Reload page
    await page.reload();

    // Go to immersion page again
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.igniteScent('tinghe');
    await immersionPage.waitForVisible();

    // "我的" button should still be visible (persisted from localStorage)
    const mineButton = page.locator('[class*="py-3 rounded-full"]').filter({ hasText: '我的' });
    await expect(mineButton).toBeVisible();
  });
});
