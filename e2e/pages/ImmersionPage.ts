import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Immersion Page Object
 * Handles the meditation/immersion phase
 */
export class ImmersionPage extends BasePage {
  readonly poemContainer: Locator;
  readonly ambianceTuner: Locator;
  readonly modeButtons: Locator;
  readonly audioToggleButton: Locator;
  readonly moodEntryButton: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    super(page);
    this.poemContainer = page.locator('.text-lg.md\\:text-xl.font-serif');
    this.ambianceTuner = page.locator('.fixed.bottom-16');
    this.modeButtons = page.locator('[class*="py-3 rounded-full"]');
    this.audioToggleButton = page.locator('button').filter({ hasText: /静音|播放/ });
    this.moodEntryButton = page.locator('button').filter({ has: this.page.locator('.lucide-book-open') });
    this.menuButton = page.locator('button').filter({ has: this.page.locator('.lucide-menu') });
  }

  /**
   * Wait for immersion page to be visible
   */
  async waitForVisible() {
    await expect(this.poemContainer.first()).toBeVisible({ timeout: 10000 });
    await expect(this.ambianceTuner).toBeVisible();
  }

  /**
   * Get all poem lines displayed
   */
  async getPoemLines(): Promise<string[]> {
    const lines = await this.poemContainer.allTextContents();
    return lines.filter(line => line.trim() !== '');
  }

  /**
   * Switch ambiance mode (本味/入眠/冥想)
   */
  async switchAmbianceMode(modeName: string) {
    const modeButton = this.modeButtons.filter({ hasText: modeName });
    await expect(modeButton).toBeVisible();
    await modeButton.click();
    await this.page.waitForTimeout(300); // Wait for transition
  }

  /**
   * Toggle audio (mute/unmute)
   */
  async toggleAudio() {
    await this.audioToggleButton.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Click mood entry button to go to Treehole
   */
  async goToMoodEntry() {
    await this.moodEntryButton.click();
    await this.waitForTransition();
  }

  /**
   * Click menu button to return to Dashboard
   */
  async goToDashboard() {
    await this.menuButton.click();
    await this.waitForTransition();
  }

  /**
   * Verify correct poem is displayed for scent
   */
  async verifyPoemForScent(scentId: string) {
    const expectedPoems: Record<string, string[]> = {
      tinghe: ['荷塘无声', '晨露在碧绿的荷叶间', '轻轻滚动'],
      wanxiang: ['老巷深处', '秋雨过后', '夕阳在青石板上'],
      xiaoyuan: ['山间小院', '苔藓在石阶上', '静静生长'],
    };

    const expectedLines = expectedPoems[scentId] || [];
    if (expectedLines.length > 0) {
      const poemText = await this.poemContainer.allTextContents();
      const combinedText = poemText.join(' ');

      for (const line of expectedLines) {
        expect(combinedText).toContain(line);
      }
    }
  }

  /**
   * Verify ambiance mode is active
   */
  async verifyAmbianceModeActive(modeId: string) {
    const activeButton = this.modeButtons.filter({ hasText: this.getModeLabel(modeId) });
    await expect(activeButton).toHaveClass(/bg-white/);
  }

  private getModeLabel(modeId: string): string {
    const labels: Record<string, string> = {
      original: '本味',
      sleep: '入眠',
      meditate: '冥想',
    };
    return labels[modeId] || '本味';
  }
}
