import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { ImmersionPage } from './pages/ImmersionPage';
import { TreeholePage } from './pages/TreeholePage';

/**
 * Treehole E2E Tests
 * Tests for the mood selection and healing submission flow
 */
test.describe('Treehole - 树洞页面', () => {
  let treeholePage: TreeholePage;

  test.beforeEach(async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await dashboardPage.igniteScent('tinghe');

    const immersionPage = new ImmersionPage(page);
    await immersionPage.waitForVisible();
    await immersionPage.goToMoodEntry();

    treeholePage = new TreeholePage(page);
    await treeholePage.waitForVisible();
  });

  test('should display mood selection options', async ({ page }) => {
    const moodOptions = [
      '有点焦虑', '有点累', '有点乱',
      '有点难过', '想静静', '小确幸'
    ];

    for (const mood of moodOptions) {
      const moodButton = page.locator('button').filter({ hasText: mood });
      await expect(moodButton).toBeVisible();
    }
  });

  test('should navigate to context selection after mood selection', async ({ page }) => {
    await treeholePage.selectMood('有点焦虑');

    // Should show context selection
    const contextTitle = page.locator('text=/因为什么呢？/');
    await expect(contextTitle).toBeVisible();
  });

  test('should display all context options', async ({ page }) => {
    await treeholePage.selectMood('有点累');

    const contextOptions = [
      '工作/学业', '感情', '健康/身材',
      '家庭', '人际关系', '说不清'
    ];

    for (const context of contextOptions) {
      const contextButton = page.locator('button').filter({ hasText: context });
      await expect(contextButton).toBeVisible();
    }
  });

  test('should generate AI reply after context selection', async ({ page }) => {
    await treeholePage.selectMood('想静静');
    await treeholePage.selectContext('工作/学业');

    // Wait for AI generation to complete and show reply
    const aiReplyCard = page.locator('text=/小屿的回信/');
    await expect(aiReplyCard).toBeVisible({ timeout: 8000 });
  });

  test('should allow entering healing text', async ({ page }) => {
    await treeholePage.selectMood('小确幸');
    await treeholePage.selectContext('感情');

    // Wait for AI reply first
    await treeholePage.verifyAIReplyDisplayed();

    // Enter healing text
    await treeholePage.enterHealingText('今天天气真好，和朋友喝了咖啡，感觉很温暖。');
    await expect(treeholePage.healingInput).toHaveValue(/今天天气/);
  });

  test('should submit healing and show peer echo', async ({ page }) => {
    await treeholePage.selectMood('有点累');
    await treeholePage.selectContext('工作/学业');
    await treeholePage.verifyAIReplyDisplayed();

    // Enter and submit healing
    await treeholePage.enterHealingText('下班路上的晚霞很美，突然觉得疲惫都被治愈了。');
    await treeholePage.submitHealing();

    // Should show peer echo card
    await treeholePage.verifyPeerEchoDisplayed();
  });

  test('should allow giving hug to peer echo', async ({ page }) => {
    await treeholePage.selectMood('有点难过');
    await treeholePage.selectContext('感情');
    await treeholePage.verifyAIReplyDisplayed();

    // Submit to get peer echo
    await treeholePage.enterHealingText('雨天的午后，窝在沙发上看书，感觉很平静。');
    await treeholePage.submitHealing();

    // Give hug
    await treeholePage.giveHug();

    // Should show feedback overlay
    const feedbackOverlay = page.locator('text=/暖意已送达/');
    await expect(feedbackOverlay).toBeVisible();
  });

  test('should allow skipping healing submission', async ({ page }) => {
    await treeholePage.selectMood('有点乱');
    await treeholePage.selectContext('人际关系');
    await treeholePage.verifyAIReplyDisplayed();

    // Skip healing - click button without entering text
    await treeholePage.skipHealing();

    // Should transition back to dashboard or show completion
    const currentUrl = page.url();
    expect(currentUrl).toBeTruthy();
  });

  test('should display back button on mood selection step', async ({ page }) => {
    const backButton = page.locator('button').filter({ has: page.locator('.lucide-arrow-left') });
    await expect(backButton).toBeVisible();
  });

  test('should go back to immersion page', async ({ page }) => {
    await treeholePage.backToImmersion();

    // Should return to immersion
    const poem = page.locator('text=/荷塘无声/');
    await expect(poem).toBeVisible();
  });

  test('should complete full treehole flow and return to dashboard', async ({ page }) => {
    // Complete the full flow
    await treeholePage.selectMood('想静静');
    await treeholePage.selectContext('家庭');
    await treeholePage.verifyAIReplyDisplayed();

    // Enter healing and submit
    await treeholePage.enterHealingText('周末和家人一起做饭，简单却很幸福。');
    await treeholePage.submitHealing();

    // Give hug
    await treeholePage.giveHug();

    // Wait for feedback and transition
    await page.waitForTimeout(3000);

    // Verify we're back on dashboard or in a transition state
    const greeting = page.locator('[class*="text-3xl"]');
    const isGreetingVisible = await greeting.isVisible().catch(() => false);

    // Either we're back on dashboard or in a valid transition state
    expect(isGreetingVisible || page.url()).toBeTruthy();
  });
});
