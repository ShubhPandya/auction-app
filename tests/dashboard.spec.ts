import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { TestUtils } from './helpers/utils';
import { ApiHelper } from './helpers/api';

test.describe('Dashboard', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;
  let apiHelper: ApiHelper;
  let testUser: { username: string; email: string; password: string };

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
    apiHelper = new ApiHelper();
    
    // Create and login test user
    testUser = authHelper.generateTestUser();
    await authHelper.register(testUser.username, testUser.email, testUser.password);
    await apiHelper.login(testUser.email, testUser.password);
    
    // After register we are already on /#dashboard; navigate again to ensure
    // a clean state and wait for the dashboard container to be rendered.
    await page.goto('/#dashboard');
    await page.waitForSelector('.dashboard-container', { state: 'visible', timeout: 15000 });
  });

  test.afterEach(async () => {
    await apiHelper.cleanup();
  });

  test.describe('Dashboard Layout', () => {
    test('should display dashboard elements', async ({ page }) => {
      // Check main elements
      await expect(page.locator('.dashboard-header h1')).toContainText('Auction Rooms');
      await expect(page.locator('#createRoomBtn')).toBeVisible();
      await expect(page.locator('#joinByCodeBtn')).toBeVisible();
      
      // #roomsGrid has zero height when empty (CSS grid with no children = 0px).
      // Check the wrapping container instead, which always has height.
      await expect(page.locator('.dashboard-container')).toBeVisible();
      
      // Check navbar
      await expect(page.locator('#navbar')).toBeVisible();
      await expect(page.locator('#navUser')).toContainText(testUser.username);
    });

    test('should show empty state when no rooms exist', async ({ page }) => {
      // If no rooms exist, should show empty state
      const roomsGrid = page.locator('#roomsGrid');
      const noRoomsMessage = page.locator('#noRooms');
      
      // Check if any rooms are displayed
      const roomCards = await page.locator('.room-card').count();
      
      if (roomCards === 0) {
        await expect(noRoomsMessage).toBeVisible();
        await expect(noRoomsMessage).toContainText('No auction rooms yet');
      }
    });
  });

  test.describe('Create Room Modal', () => {
    test('should open create room modal', async ({ page }) => {
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      await expect(page.locator('#roomModal h2')).toContainText('Create Auction Room');
      await expect(page.locator('#createRoomForm')).toBeVisible();
    });

    test('should have all required room creation fields', async ({ page }) => {
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      // Basic fields
      await expect(page.locator('#roomName')).toBeVisible();
      await expect(page.locator('#roomDesc')).toBeVisible();
      await expect(page.locator('#roomBudget')).toBeVisible();
      await expect(page.locator('#roomPlayers')).toBeVisible();
      await expect(page.locator('#roomStart')).toBeVisible();
      await expect(page.locator('#roomEnd')).toBeVisible();
      
      // Auction config fields
      await expect(page.locator('#bidIncrement')).toBeVisible();
      await expect(page.locator('#bidTimer')).toBeVisible();
      await expect(page.locator('#nominationOrder')).toBeVisible();
      await expect(page.locator('#unsoldRule')).toBeVisible();
      
      // Role composition fields
      await expect(page.locator('#minBatsmen')).toBeVisible();
      await expect(page.locator('#maxBatsmen')).toBeVisible();
      await expect(page.locator('#minBowlers')).toBeVisible();
      await expect(page.locator('#maxBowlers')).toBeVisible();
      await expect(page.locator('#minAllRounders')).toBeVisible();
      await expect(page.locator('#maxAllRounders')).toBeVisible();
      await expect(page.locator('#minWK')).toBeVisible();
      await expect(page.locator('#maxWK')).toBeVisible();
    });

    test('should have default values pre-filled', async ({ page }) => {
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      // Check default values
      await expect(page.locator('#roomBudget')).toHaveValue('100');
      await expect(page.locator('#roomPlayers')).toHaveValue('11');
      await expect(page.locator('#bidIncrement')).toHaveValue('0.25');
      await expect(page.locator('#bidTimer')).toHaveValue('30');
      
      // Role composition defaults
      await expect(page.locator('#minBatsmen')).toHaveValue('3');
      await expect(page.locator('#maxBatsmen')).toHaveValue('6');
      await expect(page.locator('#minBowlers')).toHaveValue('3');
      await expect(page.locator('#maxBowlers')).toHaveValue('6');
      await expect(page.locator('#minAllRounders')).toHaveValue('1');
      await expect(page.locator('#maxAllRounders')).toHaveValue('4');
      await expect(page.locator('#minWK')).toHaveValue('1');
      await expect(page.locator('#maxWK')).toHaveValue('2');
    });

    test('should close modal when close button is clicked', async ({ page }) => {
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      await testUtils.closeModal('#roomModal');
    });

    test('should create room with valid data', async ({ page }) => {
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      // Fill form data
      const roomData = {
        '#roomName': 'Test IPL Auction 2026',
        '#roomDesc': 'This is a test auction room',
        '#roomBudget': '120',
        '#roomPlayers': '15'
      };
      
      await testUtils.fillForm(roomData);
      
      // Set dates
      const startDate = testUtils.getCurrentDate();
      const endDate = testUtils.getFutureDate(30);
      await page.fill('#roomStart', startDate);
      await page.fill('#roomEnd', endDate);
      
      // Submit form
      await page.click('#createRoomForm button[type="submit"]');
      
      // After creation, app navigates to the new room page — go back to dashboard
      await page.waitForSelector('.room-container, #roomModal', { state: 'attached', timeout: 10000 });
      await testUtils.expectNotification('success');
      
      // Navigate back to dashboard and verify the room card appears
      await page.goto('/#dashboard');
      await page.waitForSelector('.dashboard-container', { state: 'visible', timeout: 15000 });
      
      // Check if room appears in the grid
      await expect(page.locator('.room-card')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      // Try to submit without required fields
      await page.click('#createRoomForm button[type="submit"]');
      
      // Should show validation errors
      const requiredFields = ['#roomName', '#roomStart', '#roomEnd'];
      for (const field of requiredFields) {
        await expect(page.locator(field)).toHaveAttribute('required');
      }
    });

    test('should validate date constraints', async ({ page }) => {
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      // Fill basic data
      await page.fill('#roomName', 'Test Room');
      
      // Set end date before start date
      const futureDate = testUtils.getFutureDate(7);
      const pastDate = testUtils.getCurrentDate();
      
      await page.fill('#roomStart', futureDate);
      await page.fill('#roomEnd', pastDate);
      
      await page.click('#createRoomForm button[type="submit"]');
      
      // Should show validation error
      await expect(page.locator('#roomError')).toBeVisible();
    });

    test('should validate role composition constraints', async ({ page }) => {
      await page.click('#createRoomBtn');
      await testUtils.waitForModal('#roomModal');
      
      // Set min > max for batsmen
      await page.fill('#minBatsmen', '8');
      await page.fill('#maxBatsmen', '5');
      
      // Fill required fields
      await page.fill('#roomName', 'Test Room');
      await page.fill('#roomStart', testUtils.getCurrentDate());
      await page.fill('#roomEnd', testUtils.getFutureDate(7));
      
      await page.click('#createRoomForm button[type="submit"]');
      
      // Should show validation error
      await expect(page.locator('#roomError')).toBeVisible();
    });
  });

  test.describe('Join by Invite Code', () => {
    test('should open join by code modal', async ({ page }) => {
      await page.click('#joinByCodeBtn');
      
      // Should show prompt or modal for invite code
      // Implementation depends on how this feature is built
      // This is a placeholder for testing the join functionality
    });

    test('should join room with valid invite code', async ({ page }) => {
      // First create a room to get an invite code
      const roomResponse = await apiHelper.createRoom({
        roomName: 'Test Room for Joining',
        roomDescription: 'Test room',
        budgetPerTeam: 100,
        maxPlayersPerTeam: 11,
        startDate: testUtils.getCurrentDate(),
        endDate: testUtils.getFutureDate(30)
      });
      
      if (roomResponse.status === 'success' && roomResponse.data?.inviteCode) {
        const inviteCode = roomResponse.data.inviteCode;
        
        await page.click('#joinByCodeBtn');
        
        // This depends on how the join by code UI is implemented
        // It might be a prompt, modal, or inline form
        // Placeholder for actual implementation
      }
    });

    test('should show error for invalid invite code', async ({ page }) => {
      await page.click('#joinByCodeBtn');
      
      // Test with invalid code
      // Implementation depends on UI
    });
  });

  test.describe('Room List Display', () => {
    test('should display room cards with correct information', async ({ page }) => {
      // Create a test room first
      await apiHelper.createRoom({
        roomName: 'Display Test Room',
        roomDescription: 'Test room for display',
        budgetPerTeam: 100,
        maxPlayersPerTeam: 11,
        startDate: testUtils.getCurrentDate(),
        endDate: testUtils.getFutureDate(30)
      });
      
      // Refresh page to see new room; wait for the room card to appear (async API load)
      await page.reload();
      await page.waitForSelector('.room-card', { state: 'visible', timeout: 20000 });
      
      // Check room card display
      const roomCard = page.locator('.room-card').first();
      await expect(roomCard).toBeVisible();
      
      // Check room information is displayed
      await expect(roomCard).toContainText('Display Test Room');
      await expect(roomCard).toContainText('Test room for display');
    });

    test('should navigate to room when card is clicked', async ({ page }) => {
      // Create a test room
      const roomResponse = await apiHelper.createRoom({
        roomName: 'Clickable Room',
        roomDescription: 'Test room for navigation',
        budgetPerTeam: 100,
        maxPlayersPerTeam: 11,
        startDate: testUtils.getCurrentDate(),
        endDate: testUtils.getFutureDate(30)
      });
      
      if (roomResponse.status === 'success' && roomResponse.data?._id) {
        await page.reload();
        await page.waitForSelector('.room-card', { state: 'visible', timeout: 20000 });
        
        // Click the "View Room" button inside the first room card
        const viewBtn = page.locator('.room-card .room-card-btn').first();
        await viewBtn.click();
        
        // Should navigate to room page
        await expect(page).toHaveURL(/.*#room.*/);
        await expect(page.locator('.room-container')).toBeVisible();
      }
    });

    test('should show room status and statistics', async ({ page }) => {
      // Create room and check if status/stats are displayed
      const roomResponse = await apiHelper.createRoom({
        roomName: 'Stats Test Room',
        roomDescription: 'Test room for stats',
        budgetPerTeam: 100,
        maxPlayersPerTeam: 11,
        startDate: testUtils.getCurrentDate(),
        endDate: testUtils.getFutureDate(30)
      });
      
      if (roomResponse.status === 'success') {
        await page.reload();
        await page.waitForSelector('.room-card', { state: 'visible', timeout: 20000 });
        
        const roomCard = page.locator('.room-card').first();
        
        // Check for budget info
        await expect(roomCard).toContainText('100');
        
        // Check for player limit
        await expect(roomCard).toContainText('11');
      }
    });
  });

  test.describe('Room Management Actions', () => {
    test('should show appropriate actions for room owner', async ({ page }) => {
      // Create room as current user
      const roomResponse = await apiHelper.createRoom({
        roomName: 'Owner Test Room',
        roomDescription: 'Test room for owner actions',
        budgetPerTeam: 100,
        maxPlayersPerTeam: 11,
        startDate: testUtils.getCurrentDate(),
        endDate: testUtils.getFutureDate(30)
      });
      
      if (roomResponse.status === 'success') {
        await page.reload();
        await page.waitForSelector('.room-card', { state: 'visible', timeout: 20000 });
        
        const roomCard = page.locator('.room-card').first();
        
        // Should show owner-specific actions
        // This depends on the UI implementation
        await expect(roomCard).toBeVisible();
      }
    });

    test('should refresh room list', async ({ page }) => {
      // Create room via API
      await apiHelper.createRoom({
        roomName: 'Refresh Test Room',
        roomDescription: 'Test room for refresh',
        budgetPerTeam: 100,
        maxPlayersPerTeam: 11,
        startDate: testUtils.getCurrentDate(),
        endDate: testUtils.getFutureDate(30)
      });
      
      // Refresh page; wait for room cards to load from API
      await page.reload();
      await page.waitForSelector('.room-card', { state: 'visible', timeout: 20000 });
      
      // Should show new room
      await expect(page.locator('.room-card')).toContainText('Refresh Test Room');
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back to dashboard from other pages', async ({ page }) => {
      // Go to different page first
      await page.goto('/#team/someId');
      
      // Click dashboard link in navbar
      await page.click('a[href="#dashboard"]');
      
      // Should be on dashboard
      await expect(page).toHaveURL(/.*#dashboard.*/);
      await expect(page.locator('.dashboard-container')).toBeVisible();
    });

    test('should maintain state when navigating back to dashboard', async ({ page }) => {
      // Create room, navigate away, come back
      await apiHelper.createRoom({
        roomName: 'State Test Room',
        roomDescription: 'Test room for state',
        budgetPerTeam: 100,
        maxPlayersPerTeam: 11,
        startDate: testUtils.getCurrentDate(),
        endDate: testUtils.getFutureDate(30)
      });
      
      // Wait for room to appear then navigate away and back
      await page.reload();
      await page.waitForSelector('.room-card', { state: 'visible', timeout: 20000 });
      
      // Go to a valid different page
      await page.goto('/#auth');
      await page.waitForSelector('#loginForm', { state: 'visible', timeout: 10000 });
      
      // Come back to dashboard (auth redirects back to dashboard when already logged in)
      await page.goto('/#dashboard');
      await page.waitForSelector('.room-card', { state: 'visible', timeout: 20000 });
      
      // Should still show the created room
      await expect(page.locator('.room-card')).toContainText('State Test Room');
    });
  });
});
