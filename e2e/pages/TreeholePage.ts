import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Treehole Page Object
 * Handles the mood selection and healing submission flow
 */
export class TreeholePage extends BasePage {
  readonly moodModal: Locator;
  readonly moodButtons: Locator;
  readonly contextButtons: Locator;
  readonly healingInput: Locator;
  readonly sendButton: Locator;
  readonly aiReplyCard: Locator;
  readonly hugButton: Locator;

  constructor(page: Page) {
    super(page);
    this.moodModal = page.locator('.fixed.inset-0.z-50');
    this.moodButtons = page.locator('button').filter({ hasText: /有点|想静静|小确幸/ });
    this.contextButtons = page.locator('button').filter({ hasText: /工作|感情|健康|家庭|人际|说不清/ });
    this.healingInput = page.locator('textarea[placeholder*="我也想说"]');
    this.sendButton = page.locator('button').filter({ hasText: /投递回应|带着能量出发/ });
    this.aiReplyCard = page.locator('text=/小屿的回信/');
    this.hugButton = page.locator('button').filter({ hasText: /给予拥抱/ });
  }

  /**
   * Wait for treehole page to be visible
   */
  async waitForVisible() {
    await expect(this.moodModal).toBeVisible({ timeout: 10000 });
  }

  /**
   * Select a mood option
   */
  async selectMood(moodLabel: string) {
    const moodButton = this.moodButtons.filter({ hasText: moodLabel });
    await expect(moodButton).toBeVisible();
    await moodButton.click();
    await this.page.waitForTimeout(300); // Wait for transition to context selection
  }

  /**
   * Select a context option
   */
  async selectContext(contextLabel: string) {
    const contextButton = this.contextButtons.filter({ hasText: contextLabel });
    await expect(contextButton).toBeVisible();
    await contextButton.click();
    // Wait for AI response generation
    await this.page.waitForTimeout(3000);
  }

  /**
   * Fill in healing text
   */
  async enterHealingText(text: string) {
    await this.healingInput.fill(text);
  }

  /**
   * Submit healing response
   */
  async submitHealing() {
    await expect(this.sendButton).toBeEnabled();
    await this.sendButton.click();
    // Wait for peer echo to appear
    await this.page.waitForTimeout(3000);
  }

  /**
   * Skip healing and just finish
   */
  async skipHealing() {
    await this.sendButton.click();
    await this.page.waitForTimeout(1500);
  }

  /**
   * Give a hug to the peer echo
   */
  async giveHug() {
    await expect(this.hugButton).toBeVisible({ timeout: 5000 });
    await this.hugButton.click();
    await this.page.waitForTimeout(2000); // Wait for feedback overlay
  }

  /**
   * Verify AI reply is displayed
   */
  async verifyAIReplyDisplayed() {
    await expect(this.aiReplyCard).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify peer echo card is displayed
   */
  async verifyPeerEchoDisplayed() {
    const echoCard = this.page.locator('text=/来自/');
    await expect(echoCard).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get AI reply text
   */
  async getAIReplyText(): Promise<string> {
    await this.verifyAIReplyDisplayed();
    const replyElement = this.aiReplyCard.locator('..').locator('p.font-serif');
    return await replyElement.textContent() || '';
  }

  /**
   * Navigate back to immersion (if visible)
   */
  async backToImmersion() {
    const backButton = this.page.locator('button').filter({ has: this.page.locator('.lucide-arrow-left') });
    const isVisible = await backButton.isVisible().catch(() => false);
    if (isVisible) {
      await backButton.click();
      await this.page.waitForTimeout(300);
    }
  }
}
