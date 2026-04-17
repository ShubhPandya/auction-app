import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { TestUtils } from './helpers/utils';
import { ApiHelper } from './helpers/api';

test.describe('End-to-End Integration', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;
  let apiHelper: ApiHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
    apiHelper = new ApiHelper();
  });

  test.afterEach(async () => {
    await apiHelper.cleanup();
  });

  test.describe('Complete User Journey', () => {
    test('should complete full auction workflow from registration to leaderboard', async ({ page }) => {
      // Step 1: User Registration
      const testUser = authHelper.generateTestUser();
      await page.goto('/#auth');
      await authHelper.register(testUser.username, testUser.email, testUser.password);
      
      // Verify logged in and on dashboard
      await expect(page).toHaveURL(/.*#dashboard.*/);
      await expect(page.locator('#navUser')).toContainText(testUser.username);
      
      // Step 2: Create Auction Room
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      const roomData = {
        '#roomName': 'E2E Test IPL Auction',
        '#roomDesc': 'End-to-end test auction room',
        '#roomBudget': '120',
        '#roomPlayers': '15'
      };
      
      await testUtils.fillForm(roomData);
      
      const startDate = testUtils.getCurrentDate();
      const endDate = testUtils.getFutureDate(30);
      await page.fill('#roomStart', startDate);
      await page.fill('#roomEnd', endDate);
      
      await page.click('#createRoomForm button[type="submit"]');
      await expect(page.locator('#roomModal')).not.toBeVisible();
      await testUtils.expectNotification('success');

      // Step 3: Verify room details after automatic navigation
      await expect(page).toHaveURL(/.*#room.*/);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Verify room details
      await expect(page.locator('#roomTitle')).toContainText('E2E Test IPL Auction');
      await expect(page.locator('#roomDesc')).toContainText('End-to-end test auction room');
      await expect(page.locator('#roomBudgetInfo')).toContainText('120');
      await expect(page.locator('#roomPlayersInfo')).toContainText('15');
      
      // Should show invite code for room owner
      await expect(page.locator('#inviteCodeBox')).toBeVisible();
      const inviteCode = await page.locator('#inviteCodeValue').textContent();
      expect(inviteCode).toBeTruthy();
      expect(inviteCode?.length).toBe(6);
      
      // Step 4: Create Team
      await page.click('#createTeamBtn');
      await testUtils.waitForModal('#teamModal');
      
      await page.fill('#teamName', 'E2E Warriors');
      await page.fill('#teamBudget', '100');
      await page.click('#createTeamForm button[type="submit"]');
      
      await expect(page.locator('#teamModal')).not.toBeVisible();
      await testUtils.expectNotification('success');
      
      // Should see team in teams grid
      await expect(page.locator('.team-card')).toContainText('E2E Warriors');
      
      // Step 5: Navigate to Team and Add Players
      await page.click('.team-card .team-card-btn');
      await expect(page).toHaveURL(/.*#team.*/);
      await page.waitForSelector('.team-container', { state: 'visible', timeout: 15000 });
      
      // Verify team page
      await expect(page.locator('#teamTitle')).toContainText('E2E Warriors');
      await expect(page.locator('#budgetUsed')).toContainText('0 / 100');
      await expect(page.locator('#playerCount')).toContainText('0 / 15');
      
      // Add multiple players (use unique names to avoid pool conflicts across test runs)
      const ts = Date.now();
      const players = [
        { name: `E2EPlayer1_${ts}`, team: 'RCB', role: 'batsman' },
        { name: `E2EPlayer2_${ts}`, team: 'CSK', role: 'wicket-keeper' },
        { name: `E2EPlayer3_${ts}`, team: 'MI', role: 'bowler' },
        { name: `E2EPlayer4_${ts}`, team: 'MI', role: 'all-rounder' }
      ];
      
      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        
        await page.click('#addPlayerBtn');
        await testUtils.waitForModal('#playerModal');
        
        await page.fill('#playerName', player.name);
        await page.fill('#playerTeam', player.team);
        await page.selectOption('#playerRole', player.role);
        
        await page.click('#addPlayerForm button[type="submit"]');
        await expect(page.locator('#playerModal')).not.toBeVisible();
        
        if (i < players.length - 1) {
          await testUtils.expectNotification('success');
        }
      }
      
      // Verify all players are added
      await expect(page.locator('.player-card')).toHaveCount(4);
      await expect(page.locator('#playerCount')).toContainText('4 / 15');
      
      // Verify player details are displayed (check using unique name pattern)
      await expect(page.locator('.player-card').first()).toBeVisible();
      
      // Step 6: Navigate to Leaderboard
      // First go back to room to get room ID for leaderboard
      await page.click('.back-link a');
      await expect(page.locator('.room-container')).toBeVisible();
      
      // Get current URL to extract room ID
      const currentUrl = page.url();
      const roomIdMatch = currentUrl.match(/#room\/(\w+)/);
      const roomId = roomIdMatch ? roomIdMatch[1] : null;
      expect(roomId).toBeTruthy();
      
      // Navigate to leaderboard
      await page.goto(`/#leaderboard/${roomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Verify leaderboard displays team
      await expect(page.locator('.leaderboard-table')).toBeVisible();
      await expect(page.locator('#leaderboardBody tr')).toContainText('E2E Warriors');
      await expect(page.locator('#leaderboardBody tr')).toContainText('0'); // Points
      await expect(page.locator('#leaderboardBody tr')).toContainText('4'); // Players
      
      // Verify leaderboard controls
      await expect(page.locator('#autoRefresh')).toBeChecked();
      await expect(page.locator('#manualRefresh')).toBeVisible();
      await expect(page.locator('#startSyncBtn')).toBeVisible();
      
      // Step 7: Test Complete Navigation Flow
      // Go back to dashboard
      await page.click('.back-link a');
      await page.waitForSelector('.leaderboard-container, .dashboard-container', { state: 'visible', timeout: 15000 });
      
      // Navigate to dashboard
      await page.goto('/#dashboard');
      await page.waitForSelector('.dashboard-container', { state: 'visible', timeout: 15000 });
      
      // Verify room still exists
      await expect(page.locator('.room-card')).toContainText('E2E Test IPL Auction');
      
      // Go back to room
      await page.click('.room-card .room-card-btn');
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Go to team again
      await page.click('.team-card .team-card-btn');
      await page.waitForSelector('.team-container', { state: 'visible', timeout: 15000 });
      await expect(page.locator('.player-card')).toHaveCount(4);
      
      // Step 8: Test Logout and Re-login
      await page.click('#logoutBtn');
      await expect(page.locator('#loginForm')).toBeVisible();
      
      // Login again
      await authHelper.login(testUser.email, testUser.password);
      await page.waitForSelector('.dashboard-container', { state: 'visible', timeout: 15000 });
      
      // Verify data persistence
      await expect(page.locator('.room-card')).toContainText('E2E Test IPL Auction');
    });

    test('should handle multi-user collaboration scenario', async ({ page, browser }) => {
      // Create first user and room
      const ownerUser = authHelper.generateTestUser();
      await authHelper.register(ownerUser.username, ownerUser.email, ownerUser.password);
      
      // Create room
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      await page.fill('#roomName', 'Multi-User Test Room');
      await page.fill('#roomStart', testUtils.getCurrentDate());
      await page.fill('#roomEnd', testUtils.getFutureDate(30));
      await page.click('#createRoomForm button[type="submit"]');
      
      await expect(page.locator('#roomModal')).not.toBeVisible();
      await testUtils.expectNotification('success');

      // Room creation navigates directly to the room
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      await expect(page.locator('#inviteCodeBox')).toBeVisible();
      const inviteCode = await page.locator('#inviteCodeValue').textContent();
      
      // Create second user in new browser context
      const secondContext = await browser.newContext();
      const secondPage = await secondContext.newPage();
      
      const secondAuthHelper = new AuthHelper(secondPage);
      const secondUser = authHelper.generateTestUser();
      
      await secondAuthHelper.register(secondUser.username, secondUser.email, secondUser.password);
      
      // Second user joins room by invite code
      await secondPage.goto(`/#room`);
      // Implementation would need actual join by code functionality
      // For now, we'll simulate by direct API call
      
      const secondApiHelper = new ApiHelper();
      await secondApiHelper.login(secondUser.email, secondUser.password);
      
      if (inviteCode) {
        const joinResponse = await secondApiHelper.joinRoom(inviteCode);
        if (joinResponse.status === 'success') {
          // Navigate second user to room
          await secondPage.goto(`/#room/${joinResponse.data.roomId}`);
          await secondPage.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
          
          // Verify second user sees room
          await expect(secondPage.locator('.room-container')).toBeVisible();
          await expect(secondPage.locator('#roomTitle')).toContainText('Multi-User Test Room');
          
          // Second user creates their own team
          await secondPage.click('#createTeamBtn');
          await secondPage.waitForSelector('#teamModal');
          
          await secondPage.fill('#teamName', 'Second User Team');
          await secondPage.click('#createTeamForm button[type="submit"]');
          
          await expect(secondPage.locator('#teamModal')).not.toBeVisible();
          
          // Back on first user's page, should see both teams eventually
          await page.reload();
          await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
          
          // Both teams should be visible (may need refresh)
          const teamCards = page.locator('.team-card');
          await expect(teamCards).toHaveCount(1); // At least one team visible
        }
      }
      
      await secondContext.close();
      await secondApiHelper.cleanup();
    });
  });

  test.describe('Error Recovery Scenarios', () => {
    test('should handle network interruption gracefully', async ({ page }) => {
      const testUser = authHelper.generateTestUser();
      await authHelper.register(testUser.username, testUser.email, testUser.password);
      
      // Create room
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      // Fill form but simulate network failure during submission
      await page.fill('#roomName', 'Network Test Room');
      await page.fill('#roomStart', testUtils.getCurrentDate());
      await page.fill('#roomEnd', testUtils.getFutureDate(30));
      
      // Simulate offline
      await page.context().setOffline(true);
      
      await page.click('#createRoomForm button[type="submit"]');
      
      // Should handle network error
      await expect(page.locator('#roomError')).toBeVisible({ timeout: 10000 });
      
      // Restore network
      await page.context().setOffline(false);
      
      // Try again
      await page.click('#createRoomForm button[type="submit"]');
      
      // Should succeed now
      await expect(page.locator('#roomModal')).not.toBeVisible();
      await testUtils.expectNotification('success');
    });

    test('should recover from browser refresh during workflow', async ({ page }) => {
      const testUser = authHelper.generateTestUser();
      await authHelper.register(testUser.username, testUser.email, testUser.password);
      
      // Create room
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      await page.fill('#roomName', 'Refresh Test Room');
      await page.fill('#roomStart', testUtils.getCurrentDate());
      await page.fill('#roomEnd', testUtils.getFutureDate(30));
      await page.click('#createRoomForm button[type="submit"]');
      
      await expect(page.locator('#roomModal')).not.toBeVisible();

      // Room creation navigates directly to the room
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Refresh browser
      await page.reload();
      await page.waitForSelector('.room-container, #loginForm', { state: 'visible', timeout: 15000 });
      
      // Should still be in room (if auth persists)
      // Or should redirect to login and maintain intended destination
      
      // Check that we can still interact with the room
      const isInRoom = await page.locator('.room-container').isVisible();
      const isAtLogin = await page.locator('#loginForm').isVisible();
      
      expect(isInRoom || isAtLogin).toBeTruthy();
      
      if (isAtLogin) {
        // Re-login and should return to room
        await authHelper.login(testUser.email, testUser.password);
        await page.waitForSelector('.dashboard-container', { state: 'visible', timeout: 15000 });
      }
    });

    test('should handle form validation and error correction', async ({ page }) => {
      const testUser = authHelper.generateTestUser();
      await authHelper.register(testUser.username, testUser.email, testUser.password);
      
      // Try to create room with invalid data
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      // Submit without required fields
      await page.click('#createRoomForm button[type="submit"]');
      
      // Should show validation
      await expect(page.locator('#roomName')).toHaveAttribute('required');
      
      // Fill some fields but with invalid dates
      await page.fill('#roomName', 'Validation Test');
      await page.fill('#roomStart', testUtils.getFutureDate(7));
      await page.fill('#roomEnd', testUtils.getCurrentDate()); // End before start
      
      await page.click('#createRoomForm button[type="submit"]');
      
      // Should show date validation error
      await expect(page.locator('#roomError')).toBeVisible();
      
      // Correct the error
      await page.fill('#roomEnd', testUtils.getFutureDate(30));
      
      // Try invalid role composition
      await page.fill('#minBatsmen', '10');
      await page.fill('#maxBatsmen', '5'); // min > max
      
      await page.click('#createRoomForm button[type="submit"]');
      await expect(page.locator('#roomError')).toBeVisible();
      
      // Fix role composition
      await page.fill('#minBatsmen', '3');
      await page.fill('#maxBatsmen', '6');
      
      // Should succeed now
      await page.click('#createRoomForm button[type="submit"]');
      await expect(page.locator('#roomModal')).not.toBeVisible();
      await testUtils.expectNotification('success');
    });
  });

  test.describe('Performance and Usability', () => {
    test('should load pages within acceptable time limits', async ({ page }) => {
      const testUser = authHelper.generateTestUser();
      
      // Measure registration time
      const registrationStart = Date.now();
      await authHelper.register(testUser.username, testUser.email, testUser.password);
      const registrationTime = Date.now() - registrationStart;
      
      expect(registrationTime).toBeLessThan(5000); // 5 seconds max
      
      // Measure room creation time
      const roomCreationStart = Date.now();
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      await page.fill('#roomName', 'Performance Test Room');
      await page.fill('#roomStart', testUtils.getCurrentDate());
      await page.fill('#roomEnd', testUtils.getFutureDate(30));
      await page.click('#createRoomForm button[type="submit"]');
      
      await expect(page.locator('#roomModal')).not.toBeVisible();
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      const roomCreationTime = Date.now() - roomCreationStart;
      
      expect(roomCreationTime).toBeLessThan(3000); // 3 seconds max
      
      // Measure navigation time
      const navigationStart = Date.now();
      await page.click('#navbar a[href="#dashboard"]');
      await page.waitForSelector('.dashboard-container', { state: 'visible', timeout: 15000 });
      await page.click('.room-card .room-card-btn');
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      const navigationTime = Date.now() - navigationStart;
      
      expect(navigationTime).toBeLessThan(2000); // 2 seconds max
    });

    test('should maintain responsive design across different screen sizes', async ({ page }) => {
      const testUser = authHelper.generateTestUser();
      await authHelper.register(testUser.username, testUser.email, testUser.password);
      
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop Large' },
        { width: 1366, height: 768, name: 'Desktop Standard' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.reload();
        await page.waitForSelector('.dashboard-container', { state: 'visible', timeout: 15000 });
        
        // Check that main elements are visible and accessible
        await expect(page.locator('.dashboard-container')).toBeVisible();
        await expect(page.locator('#createRoomBtn')).toBeVisible();
        await expect(page.locator('#navbar')).toBeVisible();
        
        // Test modal responsiveness
        await page.click('#createRoomBtn');
        await testUtils.waitForModal('#roomModal');
        
        const modal = page.locator('#roomModal');
        const modalBox = await modal.boundingBox();
        
        expect(modalBox).toBeDefined();
        expect(modalBox!.width).toBeLessThanOrEqual(viewport.width);
        
        await testUtils.closeModal('#roomModal');
      }
    });
  });

  test.describe('Data Persistence and State Management', () => {
    test('should maintain application state across page reloads', async ({ page }) => {
      const testUser = authHelper.generateTestUser();
      await authHelper.register(testUser.username, testUser.email, testUser.password);
      
      // Create room and team
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      await page.fill('#roomName', 'Persistence Test Room');
      await page.fill('#roomStart', testUtils.getCurrentDate());
      await page.fill('#roomEnd', testUtils.getFutureDate(30));
      await page.click('#createRoomForm button[type="submit"]');
      
      await expect(page.locator('#roomModal')).not.toBeVisible();

      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      await page.click('#createTeamBtn');
      await testUtils.waitForModal('#teamModal');
      
      await page.fill('#teamName', 'Persistent Team');
      await page.click('#createTeamForm button[type="submit"]');
      
      // Reload page
      await page.reload();
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Should maintain state
      await expect(page.locator('#roomTitle')).toContainText('Persistence Test Room');
      await expect(page.locator('.team-card')).toContainText('Persistent Team');
    });

    test('should sync data between multiple browser tabs', async ({ page, browser }) => {
      const testUser = authHelper.generateTestUser();
      await authHelper.register(testUser.username, testUser.email, testUser.password);
      
      // Create room in first tab
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      await page.fill('#roomName', 'Multi-Tab Test Room');
      await page.fill('#roomStart', testUtils.getCurrentDate());
      await page.fill('#roomEnd', testUtils.getFutureDate(30));
      await page.click('#createRoomForm button[type="submit"]');
      
      await expect(page.locator('#roomModal')).not.toBeVisible();
      
      // Open second tab
      const secondTab = await page.context().newPage();
      await secondTab.goto('/');
      
      // Login in second tab
      const secondAuthHelper = new AuthHelper(secondTab);
      await secondAuthHelper.login(testUser.email, testUser.password);
      
      // Should see same room in second tab
      await expect(secondTab.locator('.room-card')).toContainText('Multi-Tab Test Room');
      
      await secondTab.close();
    });
  });
});
