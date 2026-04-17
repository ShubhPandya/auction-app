import { Page, expect } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    // Navigate directly to auth page (avoids redirect delay from /)
    await this.page.goto('/#auth');
    
    // Wait for auth template to be cloned into #app
    await this.page.waitForSelector('#loginForm', { state: 'visible' });
    
    // Fill login form
    await this.page.fill('#loginEmail', email);
    await this.page.fill('#loginPassword', password);
    
    // Submit form
    await this.page.click('#loginForm button[type="submit"]');
    
    // After login the app sets hash to #dashboard then does window.location.reload().
    // Wait for the reload to settle by waiting for a dashboard-specific element.
    await this.page.waitForSelector('#createRoomBtn', { state: 'visible', timeout: 20000 });
    await expect(this.page.locator('#navbar')).toBeVisible();
  }

  async register(username: string, email: string, password: string) {
    // Navigate directly to auth page
    await this.page.goto('/#auth');
    
    // Switch to register form
    await this.page.click('#toggleRegister');
    await this.page.waitForSelector('#registerForm', { state: 'visible' });
    
    // Fill registration form
    await this.page.fill('#regUsername', username);
    await this.page.fill('#regEmail', email);
    await this.page.fill('#regPassword', password);
    await this.page.fill('#regConfirmPassword', password);
    
    // Submit form
    await this.page.click('#registerBtn');
    
    // After register the app sets hash to #dashboard then does window.location.reload().
    // Wait for the reload to settle by waiting for a dashboard-specific element.
    await this.page.waitForSelector('#createRoomBtn', { state: 'visible', timeout: 20000 });
    await expect(this.page.locator('#navbar')).toBeVisible();
  }

  async logout() {
    await this.page.click('#logoutBtn');
    // After logout Utils.logout() sets window.location.hash = '#auth' (no page reload).
    // Wait for the auth page template to render into #app.
    await this.page.waitForSelector('#loginForm', { state: 'visible', timeout: 10000 });
    await expect(this.page.locator('#navbar')).not.toBeVisible();
  }

  async switchToLoginForm() {
    await this.page.click('#toggleLogin');
    await this.page.waitForSelector('#loginForm', { state: 'visible' });
  }

  async switchToRegisterForm() {
    await this.page.click('#toggleRegister');
    await this.page.waitForSelector('#registerForm', { state: 'visible' });
  }

  async expectLoginError(message?: string) {
    await expect(this.page.locator('#authError')).toBeVisible();
    if (message) {
      await expect(this.page.locator('#authError')).toContainText(message);
    }
  }

  async expectRegistrationError(message?: string) {
    await expect(this.page.locator('#authError')).toBeVisible();
    if (message) {
      await expect(this.page.locator('#authError')).toContainText(message);
    }
  }

  generateTestUser() {
    const timestamp = Date.now();
    return {
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'testpass123'
    };
  }
}
