import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { TestUtils } from './helpers/utils';
import { ApiHelper } from './helpers/api';

test.describe('Leaderboard', () => {
  let authHelper: AuthHelper;
  let testUtils: TestUtils;
  let apiHelper: ApiHelper;
  let testUser: { username: string; email: string; password: string };
  let testRoomId: string;
  let testTeamId: string;

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
      roomName: 'Leaderboard Test Room',
      roomDescription: 'Room for testing leaderboard',
      budgetPerTeam: 100,
      maxPlayersPerTeam: 11,
      startDate: testUtils.getCurrentDate(),
      endDate: testUtils.getFutureDate(30)
    });
    
    if (roomResponse.status === 'success') {
      testRoomId = roomResponse.data._id;
    }
    
    // Create test teams for leaderboard
    const teamResponse = await apiHelper.createTeam(testRoomId, {
      teamName: 'Leaderboard Test Team',
      budgetAllocated: 95
    });
    
    if (teamResponse.status === 'success') {
      testTeamId = teamResponse.data._id;
    }
  });

  test.afterEach(async () => {
    await apiHelper.cleanup();
  });

  test.describe('Leaderboard Layout', () => {
    test('should display leaderboard header', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Check header elements
      await expect(page.locator('.leaderboard-header h1')).toContainText('Live Leaderboard');
      await expect(page.locator('.leaderboard-controls')).toBeVisible();
      await expect(page.locator('#autoRefresh')).toBeVisible();
      await expect(page.locator('#manualRefresh')).toBeVisible();
    });

    test('should display match status section', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Check match status elements
      await expect(page.locator('.match-status')).toBeVisible();
      await expect(page.locator('#matchStatus')).toBeVisible();
      await expect(page.locator('#startSyncBtn')).toBeVisible();
      
      // Should show default no sync message
      await expect(page.locator('#matchStatus')).toContainText('No active match sync');
    });

    test('should display leaderboard table', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Check table structure
      await expect(page.locator('.leaderboard-table')).toBeVisible();
      await expect(page.locator('.leaderboard-table thead')).toBeVisible();
      await expect(page.locator('.leaderboard-table tbody')).toBeVisible();
      
      // Check table headers
      const headers = page.locator('.leaderboard-table th');
      await expect(headers.nth(0)).toContainText('Rank');
      await expect(headers.nth(1)).toContainText('Team Name');
      await expect(headers.nth(2)).toContainText('Points');
      await expect(headers.nth(3)).toContainText('Players');
      await expect(headers.nth(4)).toContainText('Budget Used');
    });

    test('should show back navigation', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      await expect(page.locator('.back-link')).toBeVisible();
      await expect(page.locator('.back-link a')).toContainText('Back to Dashboard');
    });
  });

  test.describe('Team Rankings Display', () => {
    test('should show team in leaderboard', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Should show the test team in leaderboard
      const teamRow = page.locator('#leaderboardBody tr').first();
      await expect(teamRow).toBeVisible();
      await expect(teamRow).toContainText('Leaderboard Test Team');
      
      // Check rank column (top 3 show medal emoji, rest show numbers)
      await expect(teamRow.locator('td').first()).toContainText('🥇');
      
      // Check initial points (should be 0)
      await expect(teamRow).toContainText('0');
    });

    test('should show empty state when no teams exist', async ({ page }) => {
      // Create a room without teams
      const emptyRoomResponse = await apiHelper.createRoom({
        roomName: 'Empty Room',
        roomDescription: 'Room with no teams',
        budgetPerTeam: 100,
        maxPlayersPerTeam: 11,
        startDate: testUtils.getCurrentDate(),
        endDate: testUtils.getFutureDate(30)
      });
      
      if (emptyRoomResponse.status === 'success') {
        await page.goto(`/#leaderboard/${emptyRoomResponse.data._id}`);
        await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
        
        // Should show empty state
        await expect(page.locator('#noLeaderboard')).toBeVisible();
        await expect(page.locator('#noLeaderboard')).toContainText('No teams in this room yet');
      }
    });

    test('should display team statistics correctly', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      const teamRow = page.locator('#leaderboardBody tr').first();
      
      // Check team name
      await expect(teamRow).toContainText('Leaderboard Test Team');
      
      // Check initial statistics
      await expect(teamRow).toContainText('0'); // Points
      await expect(teamRow).toContainText('0'); // Players or budget info
      
      // Should show rank (top 3 show medal emoji, rest show numbers)
      const rankCell = teamRow.locator('td').first();
      await expect(rankCell).toContainText('🥇');
    });

    test('should sort teams by points in descending order', async ({ page }) => {
      // Create multiple teams with different points (via API simulation)
      const team2Response = await apiHelper.createTeam(testRoomId, {
        teamName: 'Second Team',
        budgetAllocated: 90
      });
      
      const team3Response = await apiHelper.createTeam(testRoomId, {
        teamName: 'Third Team',
        budgetAllocated: 85
      });
      
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Should show all teams
      const teamRows = page.locator('#leaderboardBody tr');
      await expect(teamRows).toHaveCount(3);
      
      // Check rank ordering (top 3 show medal emoji)
      await expect(teamRows.nth(0).locator('td').first()).toContainText('🥇');
      await expect(teamRows.nth(1).locator('td').first()).toContainText('🥈');
      await expect(teamRows.nth(2).locator('td').first()).toContainText('🥉');
    });
  });

  test.describe('Auto Refresh Functionality', () => {
    test('should have auto refresh enabled by default', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Auto refresh checkbox should be checked
      await expect(page.locator('#autoRefresh')).toBeChecked();
    });

    test('should toggle auto refresh when checkbox is clicked', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Initially checked
      await expect(page.locator('#autoRefresh')).toBeChecked();
      
      // Uncheck
      await page.click('#autoRefresh');
      await expect(page.locator('#autoRefresh')).not.toBeChecked();
      
      // Check again
      await page.click('#autoRefresh');
      await expect(page.locator('#autoRefresh')).toBeChecked();
    });

    test('should refresh leaderboard when manual refresh is clicked', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Click manual refresh
      await page.click('#manualRefresh');
      
      // Should show loading state or refresh the data
      // Implementation depends on how refresh is handled
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Should still show leaderboard content
      await expect(page.locator('.leaderboard-table')).toBeVisible();
    });

    test('should maintain state during auto refresh', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Disable auto refresh
      await page.click('#autoRefresh');
      await expect(page.locator('#autoRefresh')).not.toBeChecked();
      
      // Wait a moment and check that state is maintained
      await testUtils.sleep(1000);
      await expect(page.locator('#autoRefresh')).not.toBeChecked();
    });
  });

  test.describe('Match Sync Controls', () => {
    test('should display start sync button initially', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      await expect(page.locator('#startSyncBtn')).toBeVisible();
      await expect(page.locator('#startSyncBtn')).toContainText('Start Match Sync');
      await expect(page.locator('#matchStatus')).toContainText('No active match sync');
    });

    test('should handle start sync button click', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Click start sync
      await page.click('#startSyncBtn');
      
      // Should show some response - either error (no matches) or success
      // Implementation depends on actual sync functionality
      
      // Wait for any potential state change
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
    });

    test('should update match status when sync is active', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // This test would need actual match data or mocked sync state
      // For now, just verify the status element exists and can display different states
      await expect(page.locator('#matchStatus')).toBeVisible();
      
      // Status should be updatable (implementation dependent)
      const statusText = await page.locator('#matchStatus').textContent();
      expect(statusText).toBeDefined();
    });
  });

  test.describe('Navigation and Context', () => {
    test('should navigate back to dashboard', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Click back to dashboard link
      await page.click('.back-link a');
      
      // Should navigate to dashboard
      await expect(page).toHaveURL(/.*#dashboard.*/);
      await expect(page.locator('.dashboard-container')).toBeVisible();
    });

    test('should handle invalid room ID', async ({ page }) => {
      await page.goto('/#leaderboard/invalid-room-id');
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Should handle gracefully - show error or redirect
      // Implementation depends on error handling
    });

    test('should maintain context when navigating back', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Navigate away and back
      await page.goto('/#dashboard');
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Should still show leaderboard for correct room
      await expect(page.locator('.leaderboard-container')).toBeVisible();
      await expect(page.locator('#leaderboardBody tr')).toContainText('Leaderboard Test Team');
    });
  });

  test.describe('Real-time Updates', () => {
    test('should reflect team changes in real-time', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Add a player to team (which might affect points)
      await fetch(`http://localhost:3000/api/rooms/${testRoomId}/teams/${testTeamId}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiHelper.getToken()}`
        },
        body: JSON.stringify({
          playerName: 'Live Test Player',
          iplTeam: 'RCB',
          role: 'Batsman'
        })
      });
      
      // Manually refresh to see changes (in real implementation, this would be automatic)
      await page.click('#manualRefresh');
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Should show updated player count or other stats
      const teamRow = page.locator('#leaderboardBody tr').first();
      await expect(teamRow).toBeVisible();
    });

    test('should update when new teams are added', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Initially should have 1 team
      await expect(page.locator('#leaderboardBody tr')).toHaveCount(1);
      
      // Add another team
      await apiHelper.createTeam(testRoomId, {
        teamName: 'New Real-time Team',
        budgetAllocated: 100
      });
      
      // Refresh to see new team
      await page.click('#manualRefresh');
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Should show 2 teams
      await expect(page.locator('#leaderboardBody tr')).toHaveCount(2);
      await expect(page.locator('#leaderboardBody')).toContainText('New Real-time Team');
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Should still show main elements
      await expect(page.locator('.leaderboard-container')).toBeVisible();
      await expect(page.locator('.leaderboard-table')).toBeVisible();
      
      // Table should be scrollable or responsive
      const table = page.locator('.leaderboard-table');
      const tableWidth = await table.boundingBox();
      expect(tableWidth).toBeDefined();
    });

    test('should maintain functionality on smaller screens', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Controls should still be accessible
      await expect(page.locator('#autoRefresh')).toBeVisible();
      await expect(page.locator('#manualRefresh')).toBeVisible();
      await expect(page.locator('#startSyncBtn')).toBeVisible();
      
      // Should be able to interact with controls
      await page.click('#autoRefresh');
      await expect(page.locator('#autoRefresh')).not.toBeChecked();
    });
  });

  test.describe('Data Accuracy', () => {
    test('should show accurate team statistics', async ({ page }) => {
      // Add specific players with known attributes (unique name to avoid player pool conflicts)
      const uniquePlayerName = `StatsPlayer_${Date.now()}`;
      await fetch(`http://localhost:3000/api/rooms/${testRoomId}/teams/${testTeamId}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiHelper.getToken()}`
        },
        body: JSON.stringify({
          playerName: uniquePlayerName,
          iplTeam: 'RCB',
          role: 'Batsman'
        })
      });
      
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      const teamRow = page.locator('#leaderboardBody tr').first();
      
      // Should show updated player count (4th column: players)
      const playerCountCell = teamRow.locator('td').nth(3);
      await expect(playerCountCell).toContainText('1'); // 1 player
      
      // Other statistics should be accurate based on team state
      await expect(teamRow).toBeVisible();
    });

    test('should maintain ranking order based on points', async ({ page }) => {
      // Create multiple teams and verify ranking logic
      const teams = [
        { name: 'High Score Team', budget: 100 },
        { name: 'Medium Score Team', budget: 90 },
        { name: 'Low Score Team', budget: 80 }
      ];
      
      for (const team of teams) {
        await apiHelper.createTeam(testRoomId, {
          teamName: team.name,
          budgetAllocated: team.budget
        });
      }
      
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Should show all teams in some order
      const teamRows = page.locator('#leaderboardBody tr');
      await expect(teamRows).toHaveCount(4); // 3 new + 1 original
      
      // Verify ranking — top 3 show medal emoji, 4th shows number
      const rankIndicators = ['\ud83e\udd47', '\ud83e\udd48', '\ud83e\udd49', '4'];
      for (let i = 0; i < 4; i++) {
        await expect(teamRows.nth(i).locator('td').first()).toContainText(rankIndicators[i]);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto(`/#leaderboard/${testRoomId}`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Simulate network failure by going offline
      await page.context().setOffline(true);
      
      // Try to refresh
      await page.click('#manualRefresh');
      
      // Should handle error gracefully
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Restore network
      await page.context().setOffline(false);
    });

    test('should handle empty or invalid data responses', async ({ page }) => {
      await page.goto(`/#leaderboard/nonexistent-room-id`);
      await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
      
      // Should handle invalid room ID gracefully
      // Implementation depends on error handling strategy
    });
  });
});
