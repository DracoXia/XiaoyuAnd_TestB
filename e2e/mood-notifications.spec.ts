import { expect, test } from '@playwright/test';

test.describe('mood and notification review states', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens every development review state without horizontal overflow', async ({ page }) => {
    await page.goto('/?review=feature-mood-notifications');
    await expect(page.getByRole('heading', { name: '心绪与通知审核中心' })).toBeVisible();
    const links = page.getByRole('navigation', { name: '功能审核状态' }).getByRole('link');
    await expect(links).toHaveCount(8);

    const targets = [
      ['/?preview=home&fixture=unread', '[aria-label="查看更新通知"]'],
      ['/?preview=updates&fixture=unread', '[role="dialog"][aria-label="更新通知"]'],
      ['/?preview=weekly-summary&fixture=full', '[role="dialog"][aria-label="这一周的心绪"]'],
      ['/?preview=mood-record&source=manual', 'text=你现在感受如何？'],
      ['/?preview=mood-context&mood=anxious&source=manual', 'text=这份感觉和什么有关？'],
      ['/?preview=mood-feedback&mood=anxious&context=recognition&variant=1', 'text=这一刻被记下来了'],
      ['/?preview=notification-opt-in&permission=default', 'text=开启系统通知'],
      ['/?preview=timer-ended&scent=tinghe', 'text=你现在感受如何？'],
    ];

    for (const [url, selector] of targets) {
      await page.goto(url);
      await expect(page.locator(selector).first()).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    }
  });
});
