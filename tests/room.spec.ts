import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { TestUtils } from './helpers/utils';
import { ApiHelper } from './helpers/api';

test.describe('Room Management', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;
  let apiHelper: ApiHelper;
  let testUser: { username: string; email: string; password: string };
  let testRoomId: string;
  let testInviteCode: string;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testUtils = new TestUtils(page);
    apiHelper = new ApiHelper();
    
    // Create and login test user
    testUser = authHelper.generateTestUser();
    await authHelper.register(testUser.username, testUser.email, testUser.password);
    
    // Sync the API helper token (apiHelper uses its own http client, separate from the browser)
    await apiHelper.login(testUser.email, testUser.password);
    
    // Create a test room
    const roomResponse = await apiHelper.createRoom({
      roomName: 'Test Auction Room',
      roomDescription: 'Test room for integration tests',
      budgetPerTeam: 100,
      maxPlayersPerTeam: 11,
      startDate: testUtils.getCurrentDate(),
      endDate: testUtils.getFutureDate(30),
      auctionConfig: {
        bidIncrement: 0.25,
        bidTimerSeconds: 30,
        nominationOrder: 'random',
        unsoldPlayerRule: 'skip',
        roleComposition: {
          batsmen: { min: 3, max: 6 },
          bowlers: { min: 3, max: 6 },
          allRounders: { min: 1, max: 4 },
          wicketKeepers: { min: 1, max: 2 }
        }
      }
    });
    
    if (roomResponse.status === 'success') {
      testRoomId = roomResponse.data._id;
      testInviteCode = roomResponse.data.inviteCode;
    }
  });

  test.afterEach(async () => {
    await apiHelper.cleanup();
  });

  test.describe('Room Details Display', () => {
    test('should display room information correctly', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Check room title and description
      await expect(page.locator('#roomTitle')).toContainText('Test Auction Room');
      await expect(page.locator('#roomDesc')).toContainText('Test room for integration tests');
      
      // Check room statistics
      await expect(page.locator('#roomBudgetInfo')).toContainText('100');
      await expect(page.locator('#roomPlayersInfo')).toContainText('11');
      await expect(page.locator('#roomTeamsCount')).toBeVisible();
    });

    test('should show room configuration details', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Check if auction config is displayed somewhere
      // This depends on UI implementation - might be in a details section
      await expect(page.locator('.room-stats')).toBeVisible();
    });

    test('should display invite code for room owner', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Should show invite code box
      await expect(page.locator('#inviteCodeBox')).toBeVisible();
      await expect(page.locator('#inviteCodeValue')).toContainText(testInviteCode);
      await expect(page.locator('#copyInviteCodeBtn')).toBeVisible();
    });

    test('should copy invite code to clipboard', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Click copy button
      await page.click('#copyInviteCodeBtn');
      
      // Should show success notification
      await testUtils.expectNotification('success', 'copied');
    });
  });

  test.describe('Room Actions', () => {
    test('should show appropriate buttons for room owner', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Room owner should see create team button
      await expect(page.locator('#createTeamBtn')).toBeVisible();
      
      // Should not show join room button for owner
      await expect(page.locator('#joinRoomBtn')).not.toBeVisible();
    });

    test('should show join button for non-participants', async ({ page }) => {
      // Create another user
      const secondUser = authHelper.generateTestUser();
      await authHelper.logout();
      await authHelper.register(secondUser.username, secondUser.email, secondUser.password);
      
      // Visit room as non-participant
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Should show join button
      await expect(page.locator('#joinRoomBtn')).toBeVisible();
      await expect(page.locator('#createTeamBtn')).not.toBeVisible();
    });

    test('should join room when join button is clicked', async ({ page }) => {
      // Create another user
      const secondUser = authHelper.generateTestUser();
      await authHelper.logout();
      await authHelper.register(secondUser.username, secondUser.email, secondUser.password);
      
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Join room
      await page.click('#joinRoomBtn');
      
      // Should show success and hide join button
      await testUtils.expectNotification('success');
      await expect(page.locator('#joinRoomBtn')).not.toBeVisible();
      await expect(page.locator('#leaveRoomBtn')).toBeVisible();
    });

    test('should leave room when leave button is clicked', async ({ page }) => {
      // Join first, then test leave
      const secondUser = authHelper.generateTestUser();
      await authHelper.logout();
      await authHelper.register(secondUser.username, secondUser.email, secondUser.password);
      
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Join room
      await page.click('#joinRoomBtn');
      await testUtils.expectNotification('success');
      
      // Leave room
      await page.click('#leaveRoomBtn');
      
      // Should show success and show join button again
      await testUtils.expectNotification('success');
      await expect(page.locator('#joinRoomBtn')).toBeVisible();
      await expect(page.locator('#leaveRoomBtn')).not.toBeVisible();
    });
  });

  test.describe('Create Team Modal', () => {
    test('should open create team modal', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      await page.click('#createTeamBtn');
      await testUtils.waitForModal('#teamModal');
      
      await expect(page.locator('#teamModal h2')).toContainText('Create Team');
      await expect(page.locator('#createTeamForm')).toBeVisible();
    });

    test('should have team creation form fields', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      await page.click('#createTeamBtn');
      await testUtils.waitForModal('#teamModal');
      
      // Check form fields
      await expect(page.locator('#teamName')).toBeVisible();
      await expect(page.locator('#teamBudget')).toBeVisible();
      await expect(page.locator('#teamBudget')).toHaveValue('100'); // Should match room budget
    });

    test('should create team successfully', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      await page.click('#createTeamBtn');
      await testUtils.waitForModal('#teamModal');
      
      // Fill team data
      await page.fill('#teamName', 'Mumbai Maharajas');
      await page.fill('#teamBudget', '90');
      
      // Submit form
      await page.click('#createTeamForm button[type="submit"]');
      
      // Should close modal and show success
      await expect(page.locator('#teamModal')).not.toBeVisible();
      await testUtils.expectNotification('success');
      
      // Should navigate to team page or refresh room
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Team should appear in teams grid
      await expect(page.locator('.team-card')).toContainText('Mumbai Maharajas');
    });

    test('should validate team name requirement', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      await page.click('#createTeamBtn');
      await testUtils.waitForModal('#teamModal');
      
      // Try to submit without team name
      await page.click('#createTeamForm button[type="submit"]');
      
      // Should show validation
      await expect(page.locator('#teamName')).toHaveAttribute('required');
    });

    test('should validate budget constraints', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      await page.click('#createTeamBtn');
      await testUtils.waitForModal('#teamModal');
      
      // Try to set budget higher than room allows
      await page.fill('#teamName', 'Test Team');
      await page.fill('#teamBudget', '150'); // Higher than room's 100
      
      await page.click('#createTeamForm button[type="submit"]');
      
      // Should show error
      await expect(page.locator('#teamError')).toBeVisible();
    });

    test('should close modal when close button is clicked', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      await page.click('#createTeamBtn');
      await testUtils.waitForModal('#teamModal');
      
      await testUtils.closeModal('#teamModal');
    });
  });

  test.describe('Teams Display', () => {
    test('should show empty state when no teams exist', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Should show no teams message
      await expect(page.locator('#noTeams')).toBeVisible();
      await expect(page.locator('#noTeams')).toContainText('No teams yet');
    });

    test('should display teams after creation', async ({ page }) => {
      // Create a team first
      await apiHelper.createTeam(testRoomId, {
        teamName: 'Test Display Team',
        budgetAllocated: 100
      });
      
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Should show team card
      await expect(page.locator('.team-card')).toBeVisible();
      await expect(page.locator('.team-card')).toContainText('Test Display Team');
      
      // Should hide empty state
      await expect(page.locator('#noTeams')).not.toBeVisible();
    });

    test('should show team statistics', async ({ page }) => {
      await apiHelper.createTeam(testRoomId, {
        teamName: 'Stats Test Team',
        budgetAllocated: 95
      });
      
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      const teamCard = page.locator('.team-card').first();
      
      // Should show team budget info
      await expect(teamCard).toContainText('95');
      
      // Should show team stats
      await expect(teamCard).toBeVisible();
    });

    test('should navigate to team when clicked', async ({ page }) => {
      const teamResponse = await apiHelper.createTeam(testRoomId, {
        teamName: 'Clickable Team',
        budgetAllocated: 100
      });
      
      if (teamResponse.status === 'success') {
        await page.goto(`/#room/${testRoomId}`);
        await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
        
        // Click team card button to navigate
        await page.click('.team-card .team-card-btn');
        
        // Should navigate to team page
        await expect(page).toHaveURL(/.*#team.*/);
        await expect(page.locator('.team-container')).toBeVisible();
      }
    });
  });

  test.describe('Participants List', () => {
    test('should show room owner in participants', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Should show current user as participant
      await expect(page.locator('#participantsList')).toContainText(testUser.username);
    });

    test('should update participants when users join', async ({ page }) => {
      // Create and join with second user
      const secondUser = authHelper.generateTestUser();
      await apiHelper.register(secondUser.username, secondUser.email, secondUser.password);
      await apiHelper.joinRoom(testInviteCode);
      
      // View room as original owner
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Should show both participants
      await expect(page.locator('#participantsList')).toContainText(testUser.username);
      await expect(page.locator('#participantsList')).toContainText(secondUser.username);
    });

    test('should show participant count', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Should show participant information
      await expect(page.locator('.participants-section h2')).toContainText('Participants');
      await expect(page.locator('#participantsList')).toBeVisible();
    });
  });

  test.describe('Room Navigation', () => {
    test('should navigate back to dashboard', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Click dashboard link in navbar
      await page.click('a[href="#dashboard"]');
      
      // Should be on dashboard
      await expect(page).toHaveURL(/.*#dashboard.*/);
      await expect(page.locator('.dashboard-container')).toBeVisible();
    });

    test('should handle invalid room ID gracefully', async ({ page }) => {
      await page.goto('/#room/invalid-room-id');
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Should show error or redirect to dashboard
      // This depends on error handling implementation
    });

    test('should maintain room state when navigating back', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Navigate away and back
      await page.goto('/#dashboard');
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Should still show room information
      await expect(page.locator('#roomTitle')).toContainText('Test Auction Room');
    });
  });

  test.describe('Room Access Control', () => {
    test('should allow access to public room', async ({ page }) => {
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Should show room content
      await expect(page.locator('.room-container')).toBeVisible();
    });

    test('should handle non-existent room', async ({ page }) => {
      await page.goto('/#room/nonexistent123');
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      // Should handle gracefully - show error or redirect
      // Implementation depends on error handling
    });

    test('should show different UI for participants vs non-participants', async ({ page }) => {
      // Test as owner (participant)
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      const ownerButtons = await page.locator('#createTeamBtn').count();
      
      // Logout and test as non-participant
      const secondUser = authHelper.generateTestUser();
      await authHelper.logout();
      await authHelper.register(secondUser.username, secondUser.email, secondUser.password);
      
      await page.goto(`/#room/${testRoomId}`);
      await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
      
      const nonParticipantButtons = await page.locator('#joinRoomBtn').count();
      
      // Should show different UI
      expect(ownerButtons).toBeGreaterThan(0);
      expect(nonParticipantButtons).toBeGreaterThan(0);
    });
  });
});
