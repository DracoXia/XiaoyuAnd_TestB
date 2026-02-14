import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Dashboard Page Object
 * Handles interactions with the scent selection dashboard
 */
export class DashboardPage extends BasePage {
  readonly greeting: Locator;
  readonly scentCard: (id: string) => Locator;
  readonly igniteButton: (id: string) => Locator;
  readonly calendarButton: Locator;
  readonly moodMapModal: Locator;

  constructor(page: Page) {
    super(page);
    this.greeting = page.locator('[class*="text-3xl"]').first();
    this.scentCard = (id: string) =>
      page.locator(`#scent-card-${id}`);
    this.igniteButton = (id: string) =>
      this.scentCard(id).locator('text=/点一支/');
    this.calendarButton = page.locator('button').filter({ hasText: /早|午|晚/ }).nth(1);
    this.moodMapModal = page.locator('.fixed.inset-0.z-\\[70\\]');
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await this.page.goto('/');
    await this.waitForApp();
    await expect(this.greeting).toBeVisible();
  }

  /**
   * Get the greeting text (早安/午安/晚安)
   */
  async getGreeting(): Promise<string> {
    return await this.greeting.textContent() || '';
  }

  /**
   * Click on a scent card to expand it
   */
  async expandScentCard(scentId: string) {
    const card = this.scentCard(scentId);
    await card.click();
    await this.page.waitForTimeout(400); // Wait for card expand animation
  }

  /**
   * Click the "点一支" (Ignite) button to start a session
   */
  async igniteScent(scentId: string) {
    await this.expandScentCard(scentId);
    const igniteBtn = this.igniteButton(scentId);
    await expect(igniteBtn).toBeVisible();
    await igniteBtn.click();
    await this.waitForTransition();
  }

  /**
   * Open the mood map/calendar modal
   */
  async openMoodMap() {
    await this.calendarButton.click();
    await expect(this.moodMapModal).toBeVisible();
  }

  /**
   * Close the mood map modal
   */
  async closeMoodMap() {
    const closeBtn = this.moodMapModal.locator('button').filter({ hasText: /×/ });
    await closeBtn.click();
    await expect(this.moodMapModal).not.toBeVisible();
  }

  /**
   * Verify all expected scent cards are visible
   */
  async verifyScentCardsVisible() {
    const expectedScents = ['tinghe', 'wanxiang', 'xiaoyuan'];
    for (const scentId of expectedScents) {
      await expect(this.scentCard(scentId)).toBeVisible();
    }
  }

  /**
   * Get scent card details
   */
  async getScentCardDetails(scentId: string) {
    const card = this.scentCard(scentId);
    const name = await card.locator('h4, font-bold').first().textContent();
    const desc = await card.locator('text=/和.*在一起/').textContent();
    return { name, desc };
  }
}
