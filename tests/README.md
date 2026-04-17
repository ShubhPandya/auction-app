# IPL Auction System - Frontend Test Suite

This directory contains comprehensive Playwright tests for the IPL Auction System frontend.

## Test Structure

### Core Test Files
- **auth.spec.ts** - Authentication flow testing (login, register, logout)
- **dashboard.spec.ts** - Dashboard functionality (room creation, listing, navigation)
- **room.spec.ts** - Room management (details, participants, team creation)
- **team.spec.ts** - Team management (player addition/removal, statistics)
- **leaderboard.spec.ts** - Leaderboard display and real-time updates
- **e2e-integration.spec.ts** - End-to-end user journey testing

### Helper Files
- **helpers/auth.ts** - Authentication helper functions
- **helpers/utils.ts** - Common utility functions
- **helpers/api.ts** - Direct API interaction helpers

## Running Tests

### Prerequisites
1. Ensure all servers are running:
   - Express API: `npm start` (port 3000)
   - Frontend: `cd frontend && npm start` (port 8000)
   - Flask API: Should be running on port 5000

2. MongoDB should be running and populated with test data

### Test Commands

```bash
# Run all tests
npm test

# Run tests with browser UI visible
npm run test:headed

# Run tests with interactive UI
npm run test:ui

# Debug tests step by step
npm run test:debug

# Run specific test suites
npm run test:auth
npm run test:dashboard
npm run test:room
npm run test:team
npm run test:leaderboard
npm run test:e2e

# Show test report
npm run test:report
```

### Test Configuration

Tests are configured to run against:
- **Frontend URL**: http://localhost:8000
- **API URL**: http://localhost:3000
- **Browsers**: Chrome, Firefox, Safari (WebKit)

Configuration is in `playwright.config.ts`.

## Test Coverage

### Authentication Tests
- ✅ User registration with validation
- ✅ User login/logout flow
- ✅ Form switching between login/register
- ✅ Error handling for invalid credentials
- ✅ Session persistence and navigation protection

### Dashboard Tests
- ✅ Room listing and display
- ✅ Room creation with full configuration
- ✅ Form validation and error handling
- ✅ Join by invite code functionality
- ✅ Room card interaction and navigation

### Room Management Tests
- ✅ Room details display
- ✅ Participant management
- ✅ Invite code display and copying
- ✅ Team creation within rooms
- ✅ Join/leave room functionality
- ✅ Access control for owners vs participants

### Team Management Tests
- ✅ Team details and statistics display
- ✅ Player addition with form validation
- ✅ Player removal and list management
- ✅ Role-based player composition
- ✅ Budget tracking and constraints
- ✅ Real-time updates and state management

### Leaderboard Tests
- ✅ Team ranking display
- ✅ Auto-refresh functionality
- ✅ Manual refresh controls
- ✅ Match sync controls
- ✅ Real-time data updates
- ✅ Responsive design verification

### End-to-End Integration Tests
- ✅ Complete user journey from registration to leaderboard
- ✅ Multi-user collaboration scenarios
- ✅ Error recovery and network failure handling
- ✅ Performance and load time verification
- ✅ Cross-browser and viewport testing
- ✅ Data persistence and state management

## Test Data Management

Tests use:
- **Dynamic test users** - Generated with unique timestamps
- **Clean slate approach** - Each test creates its own data
- **API helpers** - For direct backend interaction when needed
- **Cleanup procedures** - Tests clean up after themselves

## Screenshots and Artifacts

- Screenshots on failure are saved to `tests/screenshots/`
- Videos of failed tests are saved to `test-results/`
- HTML reports are generated and can be viewed with `npm run test:report`

## Debugging Tests

### Interactive Debugging
```bash
# Run with browser visible
npm run test:headed

# Step through tests interactively
npm run test:debug

# Run specific test file
npx playwright test tests/auth.spec.ts --headed
```

### Common Issues

1. **Servers not running**: Ensure all required servers are running on correct ports
2. **Database state**: Tests may fail if database is in unexpected state
3. **Network timing**: Some tests may need adjustment for slower networks
4. **Browser versions**: Ensure browsers are up to date

### Test Environment Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Verify setup
npx playwright --version
```

## Contributing

When adding new tests:
1. Follow existing patterns in helper files
2. Use descriptive test names and organize in describe blocks
3. Clean up test data in afterEach hooks
4. Add appropriate assertions and error handling
5. Update this README with new test coverage

## Browser Support

Tests run on:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari (WebKit)
- ✅ Mobile viewports (simulated)

## Performance Benchmarks

Tests verify:
- Page load times < 2-5 seconds
- Form submissions < 3 seconds
- Navigation transitions < 2 seconds
- API responses < 5 seconds

Adjust timeouts in `playwright.config.ts` if needed for slower environments.
# IPL Auction System - Frontend Test Suite

This directory contains comprehensive Playwright tests for the IPL Auction System frontend.

## Test Structure

### Core Test Files
- **auth.spec.ts** - Authentication flow testing (login, register, logout)
- **dashboard.spec.ts** - Dashboard functionality (room creation, listing, navigation)
- **room.spec.ts** - Room management (details, participants, team creation)
- **team.spec.ts** - Team management (player addition/removal, statistics)
- **leaderboard.spec.ts** - Leaderboard display and real-time updates
- **e2e-integration.spec.ts** - End-to-end user journey testing

### Helper Files
- **helpers/auth.ts** - Authentication helper functions
- **helpers/utils.ts** - Common utility functions
- **helpers/api.ts** - Direct API interaction helpers

## Running Tests

### Prerequisites
1. Ensure all servers are running:
   - Express API: `npm start` (port 3000)
   - Frontend: `cd frontend && npm start` (port 8000)
   - Flask API: Should be running on port 5000

2. MongoDB should be running and populated with test data

### Test Commands

```bash
# Run all tests
npm test

# Run tests with browser UI visible
npm run test:headed

# Run tests with interactive UI
npm run test:ui

# Debug tests step by step
npm run test:debug

# Run specific test suites
npm run test:auth
npm run test:dashboard
npm run test:room
npm run test:team
npm run test:leaderboard
npm run test:e2e

# Show test report
npm run test:report
```

### Test Configuration

Tests are configured to run against:
- **Frontend URL**: http://localhost:8000
- **API URL**: http://localhost:3000
- **Browsers**: Chrome, Firefox, Safari (WebKit)

Configuration is in `playwright.config.ts`.

## Test Coverage

### Authentication Tests
- ✅ User registration with validation
- ✅ User login/logout flow
- ✅ Form switching between login/register
- ✅ Error handling for invalid credentials
- ✅ Session persistence and navigation protection

### Dashboard Tests
- ✅ Room listing and display
- ✅ Room creation with full configuration
- ✅ Form validation and error handling
- ✅ Join by invite code functionality
- ✅ Room card interaction and navigation

### Room Management Tests
- ✅ Room details display
- ✅ Participant management
- ✅ Invite code display and copying
- ✅ Team creation within rooms
- ✅ Join/leave room functionality
- ✅ Access control for owners vs participants

### Team Management Tests
- ✅ Team details and statistics display
- ✅ Player addition with form validation
- ✅ Player removal and list management
- ✅ Role-based player composition
- ✅ Budget tracking and constraints
- ✅ Real-time updates and state management

### Leaderboard Tests
- ✅ Team ranking display
- ✅ Auto-refresh functionality
- ✅ Manual refresh controls
- ✅ Match sync controls
- ✅ Real-time data updates
- ✅ Responsive design verification

### End-to-End Integration Tests
- ✅ Complete user journey from registration to leaderboard
- ✅ Multi-user collaboration scenarios
- ✅ Error recovery and network failure handling
- ✅ Performance and load time verification
- ✅ Cross-browser and viewport testing
- ✅ Data persistence and state management

## Test Data Management

Tests use:
- **Dynamic test users** - Generated with unique timestamps
- **Clean slate approach** - Each test creates its own data
- **API helpers** - For direct backend interaction when needed
- **Cleanup procedures** - Tests clean up after themselves

## Screenshots and Artifacts

- Screenshots on failure are saved to `tests/screenshots/`
- Videos of failed tests are saved to `test-results/`
- HTML reports are generated and can be viewed with `npm run test:report`

## Debugging Tests

### Interactive Debugging
```bash
# Run with browser visible
npm run test:headed

# Step through tests interactively
npm run test:debug

# Run specific test file
npx playwright test tests/auth.spec.ts --headed
```

### Common Issues

1. **Servers not running**: Ensure all required servers are running on correct ports
2. **Database state**: Tests may fail if database is in unexpected state
3. **Network timing**: Some tests may need adjustment for slower networks
4. **Browser versions**: Ensure browsers are up to date

### Test Environment Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Verify setup
npx playwright --version
```

## Contributing

When adding new tests:
1. Follow existing patterns in helper files
2. Use descriptive test names and organize in describe blocks
3. Clean up test data in afterEach hooks
4. Add appropriate assertions and error handling
5. Update this README with new test coverage

## Browser Support

Tests run on:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari (WebKit)
- ✅ Mobile viewports (simulated)

## Performance Benchmarks

Tests verify:
- Page load times < 2-5 seconds
- Form submissions < 3 seconds
- Navigation transitions < 2 seconds
- API responses < 5 seconds

Adjust timeouts in `playwright.config.ts` if needed for slower environments.
