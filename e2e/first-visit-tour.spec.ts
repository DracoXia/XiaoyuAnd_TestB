import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });
test.setTimeout(60_000);

test('a first-time user can complete the focused introduction', async ({ page }) => {
  await page.goto('/');

  const guide = page.getByRole('dialog', { name: '新手引导' });
  await expect(guide).toContainText('先选一支香');
  await page.getByRole('button', { name: '打开听荷' }).click();

  await expect(guide).toContainText('设置陪伴时间');
  await page.getByRole('button', { name: '设置燃香时间' }).click();
  await expect(guide).toContainText('选一个喜欢的时长');
  await page.getByRole('button', { name: '20 分钟' }).click();
  await page.getByRole('button', { name: '确认' }).click();

  await expect(guide).toContainText('认识这支香');
  await page.getByRole('button', { name: '制香师说' }).click();
  await expect(guide).toContainText('看完后继续');
  await page.getByRole('button', { name: '关闭制香师说' }).click();
  await expect(guide).toContainText('回到主页');
  await page.getByRole('button', { name: '关闭播放页' }).click();

  await expect(guide).toContainText('找到一周心绪');
  await page.getByRole('button', { name: '查看这一周的心绪' }).click();
  await expect(guide).toContainText('记录此刻');
  await page.getByRole('button', { name: '记录此刻' }).click();
  await page.getByRole('button', { name: '焦虑' }).click();
  await page.getByRole('button', { name: '评价认可' }).click();
  await page.getByRole('button', { name: '收好' }).click();
  await page.getByRole('button', { name: '关闭这一周的心绪' }).click();

  await expect(guide).toContainText('音乐结束时提醒你');
  await page.getByRole('button', { name: '查看更新通知' }).click();
  await expect(page.getByRole('dialog', { name: '更新通知' })).toBeVisible();
  await expect(guide).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('xiaoyu_first_visit_tour_v1'))).toBe('completed');
});
