import { Page, expect } from '@playwright/test';

export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Wait for a modal to appear and become visible
   */
  async waitForModal(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * Close a modal by clicking the close button
   */
  async closeModal(modalSelector: string) {
    await this.page.click(`${modalSelector} .modal-close`);
    await expect(this.page.locator(modalSelector)).not.toBeVisible();
  }

  /**
   * Fill a form with provided data
   */
  async fillForm(formData: Record<string, string>) {
    for (const [selector, value] of Object.entries(formData)) {
      await this.page.fill(selector, value);
    }
  }

  /**
   * Wait for notification to appear
   */
  async expectNotification(type: 'success' | 'error', message?: string) {
    const notificationSelector = `.notification.${type}`;
    const notification = this.page.locator(notificationSelector).last();
    await expect(notification).toBeVisible();
    
    if (message) {
      await expect(notification.locator('#notificationText')).toContainText(message);
    }
  }

  /**
   * Generate random test data
   */
  generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Wait for page to load completely.
   * Uses domcontentloaded + a short wait for JS-rendered content.
   * Avoids networkidle which can time out when background API calls are in flight.
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    // Give the SPA router and template cloning a moment to run
    await this.page.waitForTimeout(500);
  }

  async sleep(ms: number) {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Take a screenshot with a custom name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `tests/screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Navigate to a specific page/section and wait for its container element.
   */
  async navigateTo(section: 'dashboard' | 'room' | 'team' | 'leaderboard', id?: string) {
    let url = `/#${section}`;
    if (id && section !== 'dashboard') {
      url += `/${id}`;
    }
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');

    // Wait for the section's root container element
    const containerSelectors: Record<string, string> = {
      dashboard: '.dashboard-container',
      room: '.room-container',
      team: '.team-container',
      leaderboard: '.leaderboard-container',
    };
    const selector = containerSelectors[section];
    if (selector) {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
    }
  }

  /**
   * Get current date in YYYY-MM-DD format
   */
  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get future date in YYYY-MM-DD format
   */
  getFutureDate(daysFromNow: number = 7): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
