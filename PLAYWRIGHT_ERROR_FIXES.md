# Playwright Error Fixes

## Current Status

- Date: 2026-04-17
- Scope verified: Chromium Playwright suite
- Result: 125 passed, 0 failed

## Final Verification

The following verification runs passed after the fixes:

```powershell
npx playwright test tests/room.spec.ts tests/leaderboard.spec.ts tests/team.spec.ts --project=chromium --workers=1
npx playwright test tests/e2e-integration.spec.ts --project=chromium --workers=1
npx playwright test --project=chromium --workers=1
```

Final full-suite result:

```text
125 passed (3.4m)
```

## Root Causes Fixed

### Backend and data flow

- Team creation now stores `budgetAllocated` explicitly instead of relying only on `budgetRemaining`.
- Team stats now return `budgetAllocated`, `budgetSpent`, `budgetRemaining`, and the room-level `maxPlayersPerTeam`.
- Room lookup now preserves `participants` as user IDs for authorization logic and exposes `participantNames` separately for display.
- Player draft duplication checks are room-scoped instead of globally blocking the same player name across unrelated rooms.
- Team stats now derive `maxPlayersPerTeam` from the owning room, fixing team pages that showed `0 / 11` even when the room allowed a different limit.

### Frontend behavior

- Room page participant checks now work with the preserved participant ID list.
- Leave-room no longer depends on a blocking browser `confirm()` dialog that Playwright auto-dismissed.
- Invite-code copy now uses the Clipboard API with a DOM fallback and emits a success notification.
- Room create-team modal now opts out of native submit validation so custom budget validation can run and display `#teamError`.
- Team page no longer conflicts with modal content by reusing the same `#playersList` lookup.
- Team page budget and player-limit displays now reflect backend values correctly.
- Leaderboard no longer overwrites the initial `No active match sync` state during normal renders.
- Invalid single-segment team URLs render the team page shell and fail gracefully instead of redirecting away before the page mounts.

### Test-suite alignment

- Rank assertions were updated for medal rendering: `🥇`, `🥈`, `🥉`, then numeric ranks.
- Tests that depended on hidden `option` visibility now assert presence instead.
- E2E tests were updated to match the real app flow where room creation navigates directly into the room.
- Notification assertions now target the latest matching toast so stacked success messages do not trigger Playwright strict-mode failures.
- `TestUtils` now exposes `sleep(ms)` as an instance method for tests that call `testUtils.sleep(...)`.
- E2E selectors were aligned with real clickable elements like `.room-card .room-card-btn` and `.team-card .team-card-btn`.

## Files Updated

- `services/auctionService.js`
- `services/teamService.js`
- `frontend/public/js/pages/room.js`
- `frontend/public/js/pages/team.js`
- `frontend/public/js/pages/leaderboard.js`
- `frontend/public/js/app.js`
- `frontend/public/index.html`
- `tests/helpers/utils.ts`
- `tests/room.spec.ts`
- `tests/team.spec.ts`
- `tests/leaderboard.spec.ts`
- `tests/e2e-integration.spec.ts`

## Notes

- This document reflects the current Chromium status only.
- Firefox and WebKit were not re-run as part of this final verification pass.
