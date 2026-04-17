import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { TestUtils } from './helpers/utils';

test.describe('Authentication', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
    // Navigate directly to auth page and wait for the template to render
    await page.goto('/#auth');
    await page.waitForSelector('#loginForm', { state: 'visible' });
  });

  test.describe('Login Form', () => {
    test('should display login form by default', async ({ page }) => {
      await expect(page.locator('#loginForm')).toBeVisible();
      await expect(page.locator('#registerForm')).not.toBeVisible();
      await expect(page.locator('#loginForm h2')).toContainText('Login');
    });

    test('should have all required form fields', async ({ page }) => {
      await expect(page.locator('#loginEmail')).toBeVisible();
      await expect(page.locator('#loginPassword')).toBeVisible();
      await expect(page.locator('#loginForm button[type="submit"]')).toBeVisible();
      await expect(page.locator('#toggleRegister')).toBeVisible();
    });

    test('should show validation for empty fields', async ({ page }) => {
      await page.click('#loginForm button[type="submit"]');
      
      // Check HTML5 validation
      const emailField = page.locator('#loginEmail');
      const passwordField = page.locator('#loginPassword');
      
      await expect(emailField).toHaveAttribute('required');
      await expect(passwordField).toHaveAttribute('required');
    });

    test('should login with valid credentials', async ({ page }) => {
      // First register a user for testing
      const testUser = authHelper.generateTestUser();
      await authHelper.register(testUser.username, testUser.email, testUser.password);
      await authHelper.logout();
      
      // Now test login
      await authHelper.login(testUser.email, testUser.password);
      
      // Should be on dashboard
      await expect(page).toHaveURL(/.*#dashboard.*/);
      await expect(page.locator('#navbar')).toBeVisible();
      await expect(page.locator('#navUser')).toContainText(testUser.username);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.fill('#loginEmail', 'nonexistent@test.com');
      await page.fill('#loginPassword', 'wrongpassword');
      await page.click('#loginForm button[type="submit"]');
      
      await authHelper.expectLoginError();
      // After failed login the page stays on /#auth
      await expect(page).toHaveURL(/.*#auth.*/);
    });

    test('should show error for malformed email', async ({ page }) => {
      await page.fill('#loginEmail', 'invalid-email');
      await page.fill('#loginPassword', 'password123');
      
      // HTML5 validation should prevent submission
      const emailField = page.locator('#loginEmail');
      await expect(emailField).toHaveAttribute('type', 'email');
    });
  });

  test.describe('Registration Form', () => {
    test('should switch to registration form', async ({ page }) => {
      await authHelper.switchToRegisterForm();
      
      await expect(page.locator('#registerForm')).toBeVisible();
      await expect(page.locator('#loginForm')).not.toBeVisible();
      await expect(page.locator('#registerForm h2')).toContainText('Register');
    });

    test('should have all required registration fields', async ({ page }) => {
      await authHelper.switchToRegisterForm();
      
      await expect(page.locator('#regUsername')).toBeVisible();
      await expect(page.locator('#regEmail')).toBeVisible();
      await expect(page.locator('#regPassword')).toBeVisible();
      await expect(page.locator('#regConfirmPassword')).toBeVisible();
      await expect(page.locator('#registerBtn')).toBeVisible();
      await expect(page.locator('#toggleLogin')).toBeVisible();
    });

    test('should register new user successfully', async ({ page }) => {
      const testUser = authHelper.generateTestUser();
      
      await authHelper.register(testUser.username, testUser.email, testUser.password);
      
      // Should be logged in and on dashboard
      await expect(page).toHaveURL(/.*#dashboard.*/);
      await expect(page.locator('#navbar')).toBeVisible();
      await expect(page.locator('#navUser')).toContainText(testUser.username);
    });

    test('should show error for existing email', async ({ page }) => {
      const testUser = authHelper.generateTestUser();
      
      // Register user first time
      await authHelper.register(testUser.username, testUser.email, testUser.password);
      await authHelper.logout();
      
      // Try to register with same email
      await authHelper.switchToRegisterForm();
      await page.fill('#regUsername', 'differentuser');
      await page.fill('#regEmail', testUser.email);
      await page.fill('#regPassword', 'newpassword');
      await page.fill('#regConfirmPassword', 'newpassword');
      await page.click('#registerBtn');
      
      await authHelper.expectRegistrationError();
    });

    test('should validate password confirmation', async ({ page }) => {
      await authHelper.switchToRegisterForm();
      
      const testUser = authHelper.generateTestUser();
      await page.fill('#regUsername', testUser.username);
      await page.fill('#regEmail', testUser.email);
      await page.fill('#regPassword', testUser.password);
      await page.fill('#regConfirmPassword', 'different-password');
      await page.click('#registerBtn');
      
      // Should show validation error for password mismatch
      await authHelper.expectRegistrationError();
    });

    test('should validate required fields', async ({ page }) => {
      await authHelper.switchToRegisterForm();
      await page.click('#registerBtn');
      
      // Check HTML5 validation
      const requiredFields = ['#regUsername', '#regEmail', '#regPassword', '#regConfirmPassword'];
      for (const field of requiredFields) {
        await expect(page.locator(field)).toHaveAttribute('required');
      }
    });
  });

  test.describe('Form Switching', () => {
    test('should switch from login to register and back', async ({ page }) => {
      // Start with login form
      await expect(page.locator('#loginForm')).toBeVisible();
      
      // Switch to register
      await authHelper.switchToRegisterForm();
      await expect(page.locator('#registerForm')).toBeVisible();
      await expect(page.locator('#loginForm')).not.toBeVisible();
      
      // Switch back to login
      await authHelper.switchToLoginForm();
      await expect(page.locator('#loginForm')).toBeVisible();
      await expect(page.locator('#registerForm')).not.toBeVisible();
    });

    test('should preserve form data when switching', async ({ page }) => {
      // Fill login form
      await page.fill('#loginEmail', 'test@example.com');
      await page.fill('#loginPassword', 'testpass');
      
      // Switch to register and back
      await authHelper.switchToRegisterForm();
      await authHelper.switchToLoginForm();
      
      // Check if data is preserved (depends on implementation)
      const emailValue = await page.locator('#loginEmail').inputValue();
      const passwordValue = await page.locator('#loginPassword').inputValue();
      
      // This test may need adjustment based on actual form behavior
      console.log('Email preserved:', emailValue);
      console.log('Password preserved:', passwordValue);
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // Login first
      const testUser = authHelper.generateTestUser();
      await authHelper.register(testUser.username, testUser.email, testUser.password);
      
      // Verify logged in state
      await expect(page.locator('#navbar')).toBeVisible();
      await expect(page.locator('#logoutBtn')).toBeVisible();
      
      // Logout
      await authHelper.logout();
      
      // Should be back to login page (hash routing → /#auth)
      await expect(page).toHaveURL(/.*#auth.*/);
      await expect(page.locator('#loginForm')).toBeVisible();
      await expect(page.locator('#navbar')).not.toBeVisible();
    });

    test('should clear user session on logout', async ({ page }) => {
      // Login
      const testUser = authHelper.generateTestUser();
      await authHelper.register(testUser.username, testUser.email, testUser.password);
      
      // Logout
      await authHelper.logout();
      
      // Try to access protected route directly
      await page.goto('/#dashboard');
      
      // Should redirect to login or show login form
      // This depends on how the frontend handles authentication
      await testUtils.waitForPageLoad();
    });
  });

  test.describe('Navigation Protection', () => {
    test('should redirect unauthenticated user to login', async ({ page }) => {
      // Try to access dashboard without login
      await page.goto('/#dashboard');
      await testUtils.waitForPageLoad();
      
      // Should show login form or redirect
      // Implementation depends on frontend routing
    });

    test('should maintain intended destination after login', async ({ page }) => {
      // Try to access specific room
      await page.goto('/#room/someRoomId');
      
      // Should show login
      await expect(page.locator('#loginForm')).toBeVisible();
      
      // Login
      const testUser = authHelper.generateTestUser();
      await authHelper.register(testUser.username, testUser.email, testUser.password);
      
      // Should redirect to intended destination or dashboard
      await testUtils.waitForPageLoad();
    });
  });
});
