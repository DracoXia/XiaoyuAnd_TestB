import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object
 * Common methods and locators for all pages
 */
export class BasePage {
  readonly page: Page;
  readonly appContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.appContainer = page.locator('#root');
  }

  /**
   * Wait for the app to be fully loaded
   */
  async waitForApp() {
    await this.appContainer.waitFor({ state: 'visible' });
  }

  /**
   * Take a screenshot with automatic naming
   */
  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Get current phase from URL hash or state
   */
  async getCurrentPhase(): Promise<'dashboard' | 'immersion' | 'treehole'> {
    const url = this.page.url();
    if (url.includes('#')) {
      return 'dashboard'; // Default for now
    }
    // Check for visible elements to determine phase
    const isDashboard = await this.page.locator('text=/小屿和·香/').isVisible().catch(() => false);
    const isTreehole = await this.page.locator('text=/此刻心情/').isVisible().catch(() => false);
    const isImmersion = await this.page.locator('text=/荷塘无声/').isVisible().catch(() => false);

    if (isTreehole) return 'treehole';
    if (isImmersion) return 'immersion';
    return 'dashboard';
  }

  /**
   * Wait for navigation/transition to complete
   */
  async waitForTransition() {
    await this.page.waitForTimeout(500); // Basic wait for CSS animations
  }
}
