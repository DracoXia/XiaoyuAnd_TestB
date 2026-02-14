import { Page } from '@playwright/test';

/**
 * Test Utilities
 * Helper functions for E2E tests
 */

export async function waitForAnimation(page: Page, duration = 500) {
  await page.waitForTimeout(duration);
}

export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: true,
  });
}

export async function clearStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function mockAudioContext(page: Page) {
  await page.addInitScript(() => {
    // Mock AudioContext to prevent audio-related issues in tests
    const originalAudioContext = window.AudioContext;
    // @ts-ignore
    window.AudioContext = function() {
      const context = new originalAudioContext();
      const originalCreateGain = context.createGain;
      context.createGain = function() {
        const gainNode = originalCreateGain.call(context);
        gainNode.gain.value = 0; // Mute all audio
        return gainNode;
      };
      return context;
    };
  });
}

export async function waitForElementToBeVisible(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

export async function waitForElementToDisappear(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { state: 'hidden', timeout });
}

export function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export class TestLogger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = `[${prefix}]`;
  }

  log(message: string) {
    console.log(`${this.prefix} ${message}`);
  }

  error(message: string) {
    console.error(`${this.prefix} ERROR: ${message}`);
  }

  warn(message: string) {
    console.warn(`${this.prefix} WARN: ${message}`);
  }
}
