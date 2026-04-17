# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-integration.spec.ts >> End-to-End Integration >> Error Recovery Scenarios >> should handle network interruption gracefully
- Location: tests\e2e-integration.spec.ts:263:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('#roomError')
Expected: visible
Received: hidden
Timeout:  10000ms

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('#roomError')
    13 × locator resolved to <div id="roomError" class="error-message"></div>
       - unexpected value "hidden"

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "Auction Rooms" [level=1] [ref=e5]
      - button "+ Create New Room" [ref=e6] [cursor=pointer]
      - button "🔗 Join by Code" [ref=e7] [cursor=pointer]
    - paragraph [ref=e9]: No auction rooms yet. Create one to get started!
  - navigation [ref=e10]:
    - generic [ref=e11]:
      - heading "🏏 IPL Auction" [level=1] [ref=e13]
      - generic [ref=e14]:
        - link "Dashboard" [ref=e15] [cursor=pointer]:
          - /url: "#dashboard"
        - generic [ref=e16]: 👤 testuser1776452005984
        - button "Logout" [ref=e17] [cursor=pointer]
  - generic [ref=e19]:
    - generic [ref=e20]:
      - heading "Create Auction Room" [level=2] [ref=e21]
      - button "×" [ref=e22] [cursor=pointer]
    - generic [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]: Room Name
        - textbox "Room Name" [ref=e26]:
          - /placeholder: e.g., IPL 2026 Main Auction
          - text: Network Test Room
      - generic [ref=e27]:
        - generic [ref=e28]: Description
        - textbox "Description" [ref=e29]:
          - /placeholder: Room description
      - generic [ref=e30]:
        - generic [ref=e31]:
          - generic [ref=e32]: Budget Per Team
          - spinbutton "Budget Per Team" [ref=e33]: "100"
        - generic [ref=e34]:
          - generic [ref=e35]: Max Players
          - spinbutton "Max Players" [ref=e36]: "11"
      - generic [ref=e37]:
        - generic [ref=e38]:
          - generic [ref=e39]: Start Date
          - textbox "Start Date" [ref=e40]: 2026-04-17
        - generic [ref=e41]:
          - generic [ref=e42]: End Date
          - textbox "End Date" [ref=e43]: 2026-05-17
      - heading "Auction Config" [level=3] [ref=e44]
      - generic [ref=e45]:
        - generic [ref=e46]:
          - generic [ref=e47]: Bid Increment (Cr)
          - spinbutton "Bid Increment (Cr)" [ref=e48]: "0.25"
        - generic [ref=e49]:
          - generic [ref=e50]: Bid Timer (sec)
          - spinbutton "Bid Timer (sec)" [ref=e51]: "30"
      - generic [ref=e52]:
        - generic [ref=e53]:
          - generic [ref=e54]: Nomination Order
          - combobox "Nomination Order" [ref=e55]:
            - option "Random" [selected]
            - option "Highest Base Price First"
        - generic [ref=e56]:
          - generic [ref=e57]: Unsold Player Rule
          - combobox "Unsold Player Rule" [ref=e58]:
            - option "Skip" [selected]
            - option "Re-enter Pool"
      - heading "Role Composition (per team)" [level=4] [ref=e59]
      - generic [ref=e60]:
        - generic [ref=e61]:
          - generic [ref=e62]: Batsmen (min/max)
          - generic [ref=e63]:
            - spinbutton [ref=e64]: "3"
            - spinbutton [ref=e65]: "6"
        - generic [ref=e66]:
          - generic [ref=e67]: Bowlers (min/max)
          - generic [ref=e68]:
            - spinbutton [ref=e69]: "3"
            - spinbutton [ref=e70]: "6"
      - generic [ref=e71]:
        - generic [ref=e72]:
          - generic [ref=e73]: All-Rounders (min/max)
          - generic [ref=e74]:
            - spinbutton [ref=e75]: "1"
            - spinbutton [ref=e76]: "4"
        - generic [ref=e77]:
          - generic [ref=e78]: Wicket-Keepers (min/max)
          - generic [ref=e79]:
            - spinbutton [ref=e80]: "1"
            - spinbutton [ref=e81]: "2"
      - button "Create Room" [active] [ref=e82] [cursor=pointer]
```

# Test source

```ts
  182 |       
  183 |       // Verify data persistence
  184 |       await expect(page.locator('.room-card')).toContainText('E2E Test IPL Auction');
  185 |     });
  186 | 
  187 |     test('should handle multi-user collaboration scenario', async ({ page, browser }) => {
  188 |       // Create first user and room
  189 |       const ownerUser = authHelper.generateTestUser();
  190 |       await authHelper.register(ownerUser.username, ownerUser.email, ownerUser.password);
  191 |       
  192 |       // Create room
  193 |       await page.click('#createRoomBtn');
  194 |       await testUtils.waitForModal('#roomModal');
  195 |       
  196 |       await page.fill('#roomName', 'Multi-User Test Room');
  197 |       await page.fill('#roomStart', testUtils.getCurrentDate());
  198 |       await page.fill('#roomEnd', testUtils.getFutureDate(30));
  199 |       await page.click('#createRoomForm button[type="submit"]');
  200 |       
  201 |       await expect(page.locator('#roomModal')).not.toBeVisible();
  202 |       await testUtils.expectNotification('success');
  203 | 
  204 |       // Room creation navigates directly to the room
  205 |       await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
  206 |       
  207 |       await expect(page.locator('#inviteCodeBox')).toBeVisible();
  208 |       const inviteCode = await page.locator('#inviteCodeValue').textContent();
  209 |       
  210 |       // Create second user in new browser context
  211 |       const secondContext = await browser.newContext();
  212 |       const secondPage = await secondContext.newPage();
  213 |       
  214 |       const secondAuthHelper = new AuthHelper(secondPage);
  215 |       const secondUser = authHelper.generateTestUser();
  216 |       
  217 |       await secondAuthHelper.register(secondUser.username, secondUser.email, secondUser.password);
  218 |       
  219 |       // Second user joins room by invite code
  220 |       await secondPage.goto(`/#room`);
  221 |       // Implementation would need actual join by code functionality
  222 |       // For now, we'll simulate by direct API call
  223 |       
  224 |       const secondApiHelper = new ApiHelper();
  225 |       await secondApiHelper.login(secondUser.email, secondUser.password);
  226 |       
  227 |       if (inviteCode) {
  228 |         const joinResponse = await secondApiHelper.joinRoom(inviteCode);
  229 |         if (joinResponse.status === 'success') {
  230 |           // Navigate second user to room
  231 |           await secondPage.goto(`/#room/${joinResponse.data.roomId}`);
  232 |           await secondPage.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
  233 |           
  234 |           // Verify second user sees room
  235 |           await expect(secondPage.locator('.room-container')).toBeVisible();
  236 |           await expect(secondPage.locator('#roomTitle')).toContainText('Multi-User Test Room');
  237 |           
  238 |           // Second user creates their own team
  239 |           await secondPage.click('#createTeamBtn');
  240 |           await secondPage.waitForSelector('#teamModal');
  241 |           
  242 |           await secondPage.fill('#teamName', 'Second User Team');
  243 |           await secondPage.click('#createTeamForm button[type="submit"]');
  244 |           
  245 |           await expect(secondPage.locator('#teamModal')).not.toBeVisible();
  246 |           
  247 |           // Back on first user's page, should see both teams eventually
  248 |           await page.reload();
  249 |           await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
  250 |           
  251 |           // Both teams should be visible (may need refresh)
  252 |           const teamCards = page.locator('.team-card');
  253 |           await expect(teamCards).toHaveCount(1); // At least one team visible
  254 |         }
  255 |       }
  256 |       
  257 |       await secondContext.close();
  258 |       await secondApiHelper.cleanup();
  259 |     });
  260 |   });
  261 | 
  262 |   test.describe('Error Recovery Scenarios', () => {
  263 |     test('should handle network interruption gracefully', async ({ page }) => {
  264 |       const testUser = authHelper.generateTestUser();
  265 |       await authHelper.register(testUser.username, testUser.email, testUser.password);
  266 |       
  267 |       // Create room
  268 |       await page.click('#createRoomBtn');
  269 |       await testUtils.waitForModal('#roomModal');
  270 |       
  271 |       // Fill form but simulate network failure during submission
  272 |       await page.fill('#roomName', 'Network Test Room');
  273 |       await page.fill('#roomStart', testUtils.getCurrentDate());
  274 |       await page.fill('#roomEnd', testUtils.getFutureDate(30));
  275 |       
  276 |       // Simulate offline
  277 |       await page.context().setOffline(true);
  278 |       
  279 |       await page.click('#createRoomForm button[type="submit"]');
  280 |       
  281 |       // Should handle network error
> 282 |       await expect(page.locator('#roomError')).toBeVisible({ timeout: 10000 });
      |                                                ^ Error: expect(locator).toBeVisible() failed
  283 |       
  284 |       // Restore network
  285 |       await page.context().setOffline(false);
  286 |       
  287 |       // Try again
  288 |       await page.click('#createRoomForm button[type="submit"]');
  289 |       
  290 |       // Should succeed now
  291 |       await expect(page.locator('#roomModal')).not.toBeVisible();
  292 |       await testUtils.expectNotification('success');
  293 |     });
  294 | 
  295 |     test('should recover from browser refresh during workflow', async ({ page }) => {
  296 |       const testUser = authHelper.generateTestUser();
  297 |       await authHelper.register(testUser.username, testUser.email, testUser.password);
  298 |       
  299 |       // Create room
  300 |       await page.click('#createRoomBtn');
  301 |       await testUtils.waitForModal('#roomModal');
  302 |       
  303 |       await page.fill('#roomName', 'Refresh Test Room');
  304 |       await page.fill('#roomStart', testUtils.getCurrentDate());
  305 |       await page.fill('#roomEnd', testUtils.getFutureDate(30));
  306 |       await page.click('#createRoomForm button[type="submit"]');
  307 |       
  308 |       await expect(page.locator('#roomModal')).not.toBeVisible();
  309 | 
  310 |       // Room creation navigates directly to the room
  311 |       await page.waitForSelector('.room-container', { state: 'visible', timeout: 15000 });
  312 |       
  313 |       // Refresh browser
  314 |       await page.reload();
  315 |       await page.waitForSelector('.room-container, #loginForm', { state: 'visible', timeout: 15000 });
  316 |       
  317 |       // Should still be in room (if auth persists)
  318 |       // Or should redirect to login and maintain intended destination
  319 |       
  320 |       // Check that we can still interact with the room
  321 |       const isInRoom = await page.locator('.room-container').isVisible();
  322 |       const isAtLogin = await page.locator('#loginForm').isVisible();
  323 |       
  324 |       expect(isInRoom || isAtLogin).toBeTruthy();
  325 |       
  326 |       if (isAtLogin) {
  327 |         // Re-login and should return to room
  328 |         await authHelper.login(testUser.email, testUser.password);
  329 |         await page.waitForSelector('.dashboard-container', { state: 'visible', timeout: 15000 });
  330 |       }
  331 |     });
  332 | 
  333 |     test('should handle form validation and error correction', async ({ page }) => {
  334 |       const testUser = authHelper.generateTestUser();
  335 |       await authHelper.register(testUser.username, testUser.email, testUser.password);
  336 |       
  337 |       // Try to create room with invalid data
  338 |       await page.click('#createRoomBtn');
  339 |       await testUtils.waitForModal('#roomModal');
  340 |       
  341 |       // Submit without required fields
  342 |       await page.click('#createRoomForm button[type="submit"]');
  343 |       
  344 |       // Should show validation
  345 |       await expect(page.locator('#roomName')).toHaveAttribute('required');
  346 |       
  347 |       // Fill some fields but with invalid dates
  348 |       await page.fill('#roomName', 'Validation Test');
  349 |       await page.fill('#roomStart', testUtils.getFutureDate(7));
  350 |       await page.fill('#roomEnd', testUtils.getCurrentDate()); // End before start
  351 |       
  352 |       await page.click('#createRoomForm button[type="submit"]');
  353 |       
  354 |       // Should show date validation error
  355 |       await expect(page.locator('#roomError')).toBeVisible();
  356 |       
  357 |       // Correct the error
  358 |       await page.fill('#roomEnd', testUtils.getFutureDate(30));
  359 |       
  360 |       // Try invalid role composition
  361 |       await page.fill('#minBatsmen', '10');
  362 |       await page.fill('#maxBatsmen', '5'); // min > max
  363 |       
  364 |       await page.click('#createRoomForm button[type="submit"]');
  365 |       await expect(page.locator('#roomError')).toBeVisible();
  366 |       
  367 |       // Fix role composition
  368 |       await page.fill('#minBatsmen', '3');
  369 |       await page.fill('#maxBatsmen', '6');
  370 |       
  371 |       // Should succeed now
  372 |       await page.click('#createRoomForm button[type="submit"]');
  373 |       await expect(page.locator('#roomModal')).not.toBeVisible();
  374 |       await testUtils.expectNotification('success');
  375 |     });
  376 |   });
  377 | 
  378 |   test.describe('Performance and Usability', () => {
  379 |     test('should load pages within acceptable time limits', async ({ page }) => {
  380 |       const testUser = authHelper.generateTestUser();
  381 |       
  382 |       // Measure registration time
```