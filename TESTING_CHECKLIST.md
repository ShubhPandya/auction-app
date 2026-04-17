# IPL Auction System - Testing Checklist

## Test Environment Setup
- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:3000
- **Flask API**: http://localhost:5000
- **MongoDB**: Running on port 27017
- **Date**: April 16, 2026

---

## 1. Authentication Tests

### 1.1 User Registration
- [ ] Open http://localhost:8000
- [ ] Click "Register here" link
- [ ] Enter Username: `testuser1`
- [ ] Enter Email: `testuser1@example.com`
- [ ] Enter Password: `password123`
- [ ] Enter Confirm Password: `password123` (should match)
- [ ] Click "Register" button
- [ ] **Expected**: Success notification and redirect to Dashboard
- [ ] **Verify**: Navbar shows logged-in username

### 1.2 Registration - Password Mismatch
- [ ] Go back to Registration page
- [ ] Enter Username: `testuser2`
- [ ] Enter Email: `testuser2@example.com`
- [ ] Enter Password: `password123`
- [ ] Enter Confirm Password: `wrongpassword`
- [ ] Click "Register" button
- [ ] **Expected**: Error message "Passwords do not match"
- [ ] **Verify**: Stay on registration page, form not submitted

### 1.3 Registration - Email Already Exists
- [ ] Go back to Registration page
- [ ] Enter Username: `newuser`
- [ ] Enter Email: `testuser1@example.com` (already used)
- [ ] Enter Password: `password123`
- [ ] Enter Confirm Password: `password123`
- [ ] Click "Register" button
- [ ] **Expected**: Error message "Email already exists"
- [ ] **Verify**: Stay on registration page, form not resubmitted

### 1.4 User Login
- [ ] Click "Login here" link
- [ ] Enter Email: `testuser1@example.com`
- [ ] Enter Password: `password123`
- [ ] Click "Login" button
- [ ] **Expected**: Success notification and redirect to Dashboard
- [ ] **Verify**: Navbar shows logged-in username

### 1.5 Login - Wrong Password
- [ ] Go to login page
- [ ] Enter Email: `testuser1@example.com`
- [ ] Enter Password: `wrongpassword`
- [ ] Click "Login" button
- [ ] **Expected**: Error message (authentication failed)
- [ ] **Verify**: Stay on login page

### 1.6 Login - Non-existent Email
- [ ] Go to login page
- [ ] Enter Email: `nonexistent@example.com`
- [ ] Enter Password: `password123`
- [ ] Click "Login" button
- [ ] **Expected**: Error message (user not found)
- [ ] **Verify**: Stay on login page

### 1.7 Form Validation
- [ ] Try to register with Username less than 3 characters
- [ ] **Expected**: Error "Username must be at least 3 characters"
- [ ] Try to register with invalid email format
- [ ] **Expected**: Error "Please enter a valid email"
- [ ] Try to register with password less than 6 characters
- [ ] **Expected**: Error "Password must be at least 6 characters"

---

## 2. Dashboard Tests

### 2.1 View All Rooms
- [ ] After login, verify on Dashboard page
- [ ] **Expected**: List of all auction rooms (or empty if first time)
- [ ] Each room card shows: Name, Description, Budget, Max Players, Dates

### 2.2 Create New Room
- [ ] Click "+ Create New Room" button
- [ ] Fill form:
  - Room Name: `IPL 2026 Auction`
  - Description: `Test auction room`
  - Budget: `500000000`
  - Max Players: `500`
- [ ] Click "Create Room" button
- [ ] **Expected**: New room appears in the room list
- [ ] **Verify**: Room card shows correct information

### 2.3 Room Card Display
- [ ] Verify room cards display:
  - [ ] Room name
  - [ ] Description
  - [ ] Budget amount
  - [ ] Max players limit
  - [ ] Team count
  - [ ] Member count
  - [ ] Status badge
  - [ ] "View Details" button

---

## 3. Room Management Tests

### 3.1 View Room Details
- [ ] Click "View Details" on any room
- [ ] **Expected**: Room details page loads
- [ ] **Verify**: Display shows:
  - [ ] Room name and description
  - [ ] Room statistics (budget, max players, dates)
  - [ ] Join/Leave button (if not owner)
  - [ ] Create Team button
  - [ ] List of existing teams
  - [ ] List of participants

### 3.2 Join Room
- [ ] Click "Join Room" button
- [ ] **Expected**: Button changes to "Leave Room"
- [ ] **Verify**: User appears in participants list
- [ ] **Verify**: User can now create teams

### 3.3 Create Team in Room
- [ ] Click "Create Team" button
- [ ] Fill form:
  - Team Name: `Mumbai Indians`
  - Budget: `100000000`
- [ ] Click "Create Team" button
- [ ] **Expected**: New team appears in teams section
- [ ] **Verify**: Team card shows correct budget

### 3.4 Team Card Display
- [ ] Verify team cards display:
  - [ ] Team name
  - [ ] Total players
  - [ ] Available budget
  - [ ] Points (initially 0)
  - [ ] "Manage Team" button

---

## 4. Team Management Tests

### 4.1 Open Team Management
- [ ] Click "Manage Team" button on any team
- [ ] **Expected**: Team management page loads
- [ ] **Verify**: Display shows:
  - [ ] Team name
  - [ ] Team statistics (points, budget used, player count)
  - [ ] List of current players (empty if new)
  - [ ] "+ Add Player" button

### 4.2 Add Player to Team - Manual Entry
- [ ] Click "+ Add Player" button
- [ ] Modal opens with form
- [ ] Enter Player Name: `Virat Kohli`
- [ ] Enter Country: `India`
- [ ] Enter Role: `Batsman`
- [ ] Click "Add Player" button
- [ ] **Expected**: Player appears in team roster
- [ ] **Verify**: Budget is updated correctly

### 4.3 Add Player to Team - Quick Select
- [ ] Click "+ Add Player" button
- [ ] Modal shows popular players list
- [ ] Click on any popular player (e.g., "Virat Kohli")
- [ ] **Expected**: Player is added immediately
- [ ] **Verify**: Modal closes and player appears in roster

### 4.4 Player Card Display
- [ ] Verify player cards display:
  - [ ] Player name
  - [ ] Player role/type
  - [ ] Country
  - [ ] Status
  - [ ] Remove button (X)

### 4.5 Remove Player from Team
- [ ] Click remove button (X) on any player
- [ ] **Expected**: Player removed from roster
- [ ] **Verify**: Budget updated correctly
- [ ] **Verify**: Player count decreases

### 4.6 Add Multiple Players
- [ ] Add 5 different players to team
- [ ] **Expected**: All players added successfully
- [ ] **Verify**: Budget calculation correct for all players
- [ ] **Verify**: Player count shows 5

---

## 5. Leaderboard Tests

### 5.1 View Leaderboard
- [ ] Navigate to Dashboard
- [ ] Click on room name or "View Leaderboard"
- [ ] **Expected**: Leaderboard page loads
- [ ] **Verify**: Display shows:
  - [ ] Team rankings table
  - [ ] Auto-refresh checkbox
  - [ ] Manual refresh button
  - [ ] Start Sync button

### 5.2 Leaderboard Ranking Display
- [ ] Verify rankings table shows:
  - [ ] Rank (1, 2, 3, etc.)
  - [ ] Team name
  - [ ] Total points
  - [ ] Player count
  - [ ] Budget used

### 5.3 Medal Display for Top 3
- [ ] Verify rank 1 shows 🥇 gold medal styling
- [ ] Verify rank 2 shows 🥈 silver medal styling
- [ ] Verify rank 3 shows 🥉 bronze medal styling
- [ ] Verify other ranks have no special styling

### 5.4 Auto-Refresh Functionality
- [ ] Check "Enable Auto-Refresh" checkbox
- [ ] **Expected**: Checkbox is checked
- [ ] Make a change (add player to team in another window)
- [ ] Wait 5 seconds
- [ ] **Expected**: Leaderboard updates automatically
- [ ] Uncheck auto-refresh
- [ ] **Expected**: No more automatic updates

### 5.5 Manual Refresh
- [ ] Click "Refresh Now" button
- [ ] **Expected**: Leaderboard updates immediately
- [ ] **Verify**: Loading state is shown (optional)

---

## 6. Navigation Tests

### 6.1 Navigation Links
- [ ] Click "Dashboard" in navbar
- [ ] **Expected**: Navigate to dashboard
- [ ] Click back to room
- [ ] **Expected**: Navigate to room details
- [ ] Click team card
- [ ] **Expected**: Navigate to team management

### 6.2 Logout Functionality
- [ ] Click "Logout" button in navbar
- [ ] **Expected**: Redirect to login page
- [ ] **Verify**: localStorage cleared (check browser DevTools)
- [ ] **Verify**: Cannot access dashboard without login

### 6.3 Session Persistence
- [ ] Login to system
- [ ] Refresh the page
- [ ] **Expected**: Still logged in (session persists)
- [ ] Navigate to different pages
- [ ] **Expected**: All pages still accessible

---

## 7. Error Handling Tests

### 7.1 Network Error Display
- [ ] Stop the backend server (port 3000)
- [ ] Try any action (create room, add player, etc.)
- [ ] **Expected**: Error notification displayed
- [ ] **Verify**: Graceful error handling, no crashes

### 7.2 Form Submission Errors
- [ ] Leave required fields empty
- [ ] Click submit
- [ ] **Expected**: Error message about required fields
- [ ] Fill invalid data (e.g., invalid email)
- [ ] Click submit
- [ ] **Expected**: Validation error displayed

### 7.3 Duplicate Entry Prevention
- [ ] Try to create room with same name
- [ ] **Expected**: Success or error handled gracefully
- [ ] Try to add same player twice to team
- [ ] **Expected**: Handled appropriately (duplicate prevented or allowed based on business logic)

---

## 8. UI/UX Tests

### 8.1 Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] **Expected**: All elements properly displayed
- [ ] Resize window to tablet size (768px)
- [ ] **Expected**: Layout adjusts, no overflow
- [ ] Resize to mobile size (375px)
- [ ] **Expected**: Responsive layout, scrollable content

### 8.2 Button States
- [ ] Verify buttons are enabled by default
- [ ] Click button to submit form
- [ ] **Expected**: Button shows loading state (disabled, text changes)
- [ ] After response, button returns to normal

### 8.3 Form Feedback
- [ ] Type into form fields
- [ ] **Expected**: Real-time validation feedback
- [ ] Submit forms
- [ ] **Expected**: Success/error notifications appear
- [ ] Notifications auto-dismiss after 3-4 seconds

### 8.4 Visual Hierarchy
- [ ] Verify headers are prominent
- [ ] Verify important buttons stand out
- [ ] Verify links are clearly distinguishable
- [ ] Verify error messages are visible and attention-grabbing

---

## 9. Data Persistence Tests

### 9.1 Room Creation Persistence
- [ ] Create a new room
- [ ] Refresh page
- [ ] **Expected**: Room still exists in list
- [ ] Close browser completely
- [ ] Re-open and login
- [ ] **Expected**: Room still exists

### 9.2 Team Creation Persistence
- [ ] Create team in room
- [ ] Navigate away and back
- [ ] **Expected**: Team still exists
- [ ] Refresh page
- [ ] **Expected**: Team data persists

### 9.3 Player Data Persistence
- [ ] Add players to team
- [ ] Refresh page
- [ ] **Expected**: All players still there
- [ ] Close browser and reopen
- [ ] **Expected**: Players still in roster

---

## 10. Performance Tests

### 10.1 Page Load Time
- [ ] Open each page and note load time
- [ ] Dashboard: ___ ms
- [ ] Room details: ___ ms
- [ ] Team management: ___ ms
- [ ] Leaderboard: ___ ms
- [ ] **Expected**: All pages load within 2 seconds

### 10.2 API Response Time
- [ ] Monitor network tab in DevTools
- [ ] Check API response times
- [ ] **Expected**: Most API calls complete in <500ms

### 10.3 Polling Performance
- [ ] Enable auto-refresh on leaderboard
- [ ] Monitor network in DevTools
- [ ] **Expected**: Requests every 5 seconds
- [ ] CPU/Memory usage remains stable
- [ ] No memory leaks after 5 minutes

---

## 11. Browser Compatibility Tests

- [ ] **Chrome/Edge** (Chromium): ___ Pass/Fail
- [ ] **Firefox**: ___ Pass/Fail
- [ ] **Safari** (if available): ___ Pass/Fail

---

## Test Results Summary

**Tester Name**: ________________  
**Test Date**: April 16, 2026  
**Total Tests**: 60+  
**Passed**: ___  
**Failed**: ___  
**Blocked**: ___  

### Critical Issues Found:
1. 
2. 
3. 

### Minor Issues Found:
1. 
2. 
3. 

### Notes:
