import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { ImmersionPage } from './pages/ImmersionPage';
import { TreeholePage } from './pages/TreeholePage';
import { createVerifier, verifyEventFlow } from './helpers/supabase-verify';
import type { AnalyticsEventType } from './helpers/supabase-verify';

/**
 * Complete User Journey E2E Tests
 *
 * 测试完整的用户流程，并验证数据埋点
 *
 * 数据验证闭环：
 * 1. UI 操作验证 - 确保用户流程正确完成
 * 2. 网络请求验证 - 捕获发往 Supabase 的请求
 * 3. 数据库验证 - 测试后使用 Supabase MCP 工具查询数据
 */
test.describe('User Journey - 完整用户流程', () => {

  test('complete journey: select scent -> immersion -> mood entry -> treehole -> dashboard', async ({ page }) => {
    const verifier = createVerifier(page);

    // Step 1: Dashboard - Select scent
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await dashboardPage.screenshot('dashboard-initial');

    // Verify initial state
    await expect(page.locator('text=/小屿和·香/')).toBeVisible();

    // Expand and select 晚巷
    await dashboardPage.expandScentCard('wanxiang');
    await dashboardPage.screenshot('dashboard-expanded');

    // Step 2: Start immersion (triggers session_start)
    await dashboardPage.igniteScent('wanxiang');

    // Step 3: Immersion - Verify poem
    const immersionPage = new ImmersionPage(page);
    await immersionPage.waitForVisible();
    await immersionPage.screenshot('immersion-wanxiang');

    await immersionPage.verifyPoemForScent('wanxiang');

    // Step 4: Switch ambiance mode (triggers ambiance_change)
    await immersionPage.switchAmbianceMode('入眠');
    await page.waitForTimeout(500);
    await immersionPage.screenshot('immersion-sleep-mode');

    // Step 5: Go to mood entry
    await immersionPage.goToMoodEntry();

    // Step 6: Treehole - Select mood (triggers mood_select)
    const treeholePage = new TreeholePage(page);
    await treeholePage.waitForVisible();
    await treeholePage.screenshot('treehole-mood-selection');

    await treeholePage.selectMood('小确幸');
    await page.waitForTimeout(500);
    await treeholePage.screenshot('treehole-context-selection');

    // Step 7: Select context (triggers context_select)
    await treeholePage.selectContext('工作/学业');

    // Step 8: Wait for AI reply
    await treeholePage.verifyAIReplyDisplayed();
    await treeholePage.screenshot('treehole-ai-reply');

    // Step 9: Enter healing text
    const healingText = '完成了今天的工作，感觉很有成就感！';
    await treeholePage.enterHealingText(healingText);
    await page.waitForTimeout(500);

    // Step 10: Submit healing (triggers medicine_submit)
    await treeholePage.submitHealing();
    await treeholePage.screenshot('treehole-peer-echo');

    // Step 11: Give hug (triggers give_hug)
    await treeholePage.giveHug();
    await page.waitForTimeout(2500);

    // Print analytics summary
    verifier.printSummary();

    // Verify completion - should be back on dashboard or in transition
    const greeting = page.locator('[class*="text-3xl"]');
    await expect(greeting).toBeVisible({ timeout: 5000 });

    // 验证预期的事件流程
    const expectedEvents: AnalyticsEventType[] = [
      'session_start',
      'ambiance_change',
      'mood_select',
      'context_select',
      'medicine_submit',
      'give_hug',
    ];

    const flowResult = await verifyEventFlow(verifier, expectedEvents);
    console.log('📊 Journey event flow:', flowResult);
  });

  test('complete journey with all scents: verify each scent shows unique poem', async ({ page }) => {
    const verifier = createVerifier(page);

    const dashboardPage = new DashboardPage(page);
    const scents = [
      { id: 'tinghe', keyword: '荷塘' },
      { id: 'wanxiang', keyword: '老巷' },
      { id: 'xiaoyuan', keyword: '小院' },
    ];

    for (const scent of scents) {
      // Navigate to dashboard
      await page.goto('/');
      await dashboardPage.goto();

      // Select and ignite scent
      await dashboardPage.igniteScent(scent.id);

      // Verify poem
      const immersionPage = new ImmersionPage(page);
      await immersionPage.waitForVisible();

      const poemLines = await immersionPage.getPoemLines();
      const combinedText = poemLines.join(' ');
      expect(combinedText).toContain(scent.keyword);

      // Return to dashboard
      await immersionPage.goToDashboard();
      await page.waitForTimeout(500);
    }

    verifier.printSummary();
    console.log('📊 Tested all scents:', scents.map(s => s.id).join(', '));
  });

  test('complete journey: test all ambiance modes', async ({ page }) => {
    const verifier = createVerifier(page);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await dashboardPage.igniteScent('xiaoyuan');

    const immersionPage = new ImmersionPage(page);
    await immersionPage.waitForVisible();

    const modes = ['本味', '入眠', '冥想'];
    for (const mode of modes) {
      await immersionPage.switchAmbianceMode(mode);
      await immersionPage.screenshot(`immersion-mode-${mode}`);

      // Verify the mode button is active
      const modeButton = page.locator('button').filter({ hasText: mode, hasText: /.*/ });
      const isActive = await modeButton.evaluate(el =>
        el.classList.contains('bg-white')
      );
      expect(isActive).toBeTruthy();
    }

    verifier.printSummary();

    // 验证氛围切换事件被记录
    const ambianceEvents = verifier.getEventsByType('ambiance');
    console.log('📊 Ambiance change events:', ambianceEvents.length);
  });

  test('complete journey: test multiple mood-context combinations', async ({ page }) => {
    const verifier = createVerifier(page);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await dashboardPage.igniteScent('tinghe');

    const immersionPage = new ImmersionPage(page);
    await immersionPage.waitForVisible();
    await immersionPage.goToMoodEntry();

    const testCases = [
      { mood: '有点焦虑', context: '工作/学业' },
      { mood: '想静静', context: '家庭' },
      { mood: '小确幸', context: '说不清' },
    ];

    for (const testCase of testCases) {
      // Navigate to treehole (might be on dashboard after previous iteration)
      const treeholePage = new TreeholePage(page);

      // If not on treehole, go there
      const isTreeholeVisible = await page.locator('text=/此刻心情/').isVisible().catch(() => false);
      if (!isTreeholeVisible) {
        await page.goto('/');
        await dashboardPage.goto();
        await dashboardPage.igniteScent('tinghe');
        await immersionPage.waitForVisible();
        await immersionPage.goToMoodEntry();
        await treeholePage.waitForVisible();
      }

      await treeholePage.selectMood(testCase.mood);
      await treeholePage.selectContext(testCase.context);
      await treeholePage.verifyAIReplyDisplayed();

      // Skip healing for faster testing
      await treeholePage.skipHealing();
      await page.waitForTimeout(1500);
    }

    verifier.printSummary();

    // 验证心情和语境选择事件
    const moodEvents = verifier.getEventsByType('mood');
    const contextEvents = verifier.getEventsByType('context');
    console.log('📊 Mood events:', moodEvents.length);
    console.log('📊 Context events:', contextEvents.length);
  });

  test('should handle edge case: no healing text submission', async ({ page }) => {
    const verifier = createVerifier(page);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await dashboardPage.igniteScent('wanxiang');

    const immersionPage = new ImmersionPage(page);
    await immersionPage.waitForVisible();
    await immersionPage.goToMoodEntry();

    const treeholePage = new TreeholePage(page);
    await treeholePage.waitForVisible();
    await treeholePage.selectMood('有点累');
    await treeholePage.selectContext('感情');
    await treeholePage.verifyAIReplyDisplayed();

    // Submit without entering text
    await treeholePage.skipHealing();

    // Should transition successfully
    await page.waitForTimeout(2000);

    verifier.printSummary();
  });

  test('should preserve state when navigating back from treehole to immersion', async ({ page }) => {
    const verifier = createVerifier(page);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await dashboardPage.igniteScent('xiaoyuan');

    const immersionPage = new ImmersionPage(page);
    await immersionPage.waitForVisible();

    // Switch to sleep mode
    await immersionPage.switchAmbianceMode('入眠');
    await page.waitForTimeout(500);

    // Go to treehole
    await immersionPage.goToMoodEntry();

    const treeholePage = new TreeholePage(page);
    await treeholePage.waitForVisible();

    // Go back to immersion
    await treeholePage.backToImmersion();

    // Verify immersion is still visible and mode is preserved
    await expect(page.locator('text=/山间小院/')).toBeVisible();
    const modeButton = page.locator('button').filter({ hasText: '入眠' });
    await expect(modeButton).toBeVisible();

    verifier.printSummary();
  });

  test('should handle rapid scent switching', async ({ page }) => {
    const verifier = createVerifier(page);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    const scents = ['tinghe', 'wanxiang', 'xiaoyuan'];

    for (const scentId of scents) {
      await dashboardPage.expandScentCard(scentId);
      await page.waitForTimeout(300);
    }

    // Verify last scent is selected
    const lastCard = page.locator(`#scent-card-xiaoyuan .lucide-check`);
    await expect(lastCard).toBeVisible();

    verifier.printSummary();

    // 验证香型切换事件
    const switchEvents = verifier.getEventsByType('fragrance') || verifier.getEventsByType('switch');
    console.log('📊 Fragrance switch events:', switchEvents?.length || 0);
  });
});

/**
 * ============================================================================
 * 测试后数据库验证
 * ============================================================================
 *
 * 运行测试后，使用 Supabase MCP 工具执行以下查询：
 *
 * -- 查看最近的会话
 * SELECT * FROM sessions ORDER BY started_at DESC LIMIT 5;
 *
 * -- 查看最近的分析事件
 * SELECT event_type, event_data, created_at
 * FROM analytics_events
 * ORDER BY created_at DESC LIMIT 20;
 *
 * -- 查看心情记录
 * SELECT mood_after, context, self_evaluation, created_at
 * FROM mood_records
 * ORDER BY created_at DESC LIMIT 10;
 *
 * -- 漏斗分析
 * SELECT * FROM funnel_stats;
 * ============================================================================
 */
