import { expect, test } from '@playwright/test';

const states = [
  ['01-home-unread', '/?preview=home&fixture=unread'],
  ['02-update-center', '/?preview=updates&fixture=unread'],
  ['03-weekly-summary', '/?preview=weekly-summary&fixture=full'],
  ['04-mood-record', '/?preview=mood-record&source=manual'],
  ['05-mood-context', '/?preview=mood-context&mood=anxious&source=manual'],
  ['06-mood-feedback', '/?preview=mood-feedback&mood=anxious&context=recognition&variant=1'],
  ['07-notification-opt-in', '/?preview=notification-opt-in&permission=default'],
  ['08-timer-ended', '/?preview=timer-ended&scent=tinghe'],
] as const;

test('captures the 390x844 acceptance states after an accessibility snapshot', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [name, url] of states) {
    await page.goto(url);
    await page.locator('body').ariaSnapshot();
    await page.waitForTimeout(900);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `output/playwright/mood-notifications/${name}-390x844.png`, fullPage: false });
  }
});

test('captures the 430x932 wide-phone regression', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto('/?preview=weekly-summary&fixture=full');
  await page.locator('body').ariaSnapshot();
  await page.waitForTimeout(900);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'output/playwright/mood-notifications/09-weekly-summary-430x932.png', fullPage: false });
});
