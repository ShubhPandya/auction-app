# IPL Auction App — Full Roadmap & Implementation Task List

**Based on:** requirements.md v1.1 (Hostless, App-Driven Auction)  
**API Source:** Flask scraper at `/api` (Cricbuzz v2 endpoints)  
**Date:** April 2026  

---

## Gap Analysis: Requirements vs Current State

| # | Requirement | Status | Gap |
|---|-------------|--------|-----|
| 1 | Room invite code (6-digit shareable) | ❌ Missing | No invite code system |
| 2 | Room config: bid increment, bid timer, nomination order | ❌ Missing | Room only stores name/budget/maxPlayers |
| 3 | Room config: per-role squad limits (min/max) | ❌ Missing | No role composition rules |
| 4 | Room config: unsold player rule | ❌ Missing | No unsold tracking |
| 5 | Participant ready-check before auction start | ❌ Missing | No readiness state |
| 6 | Pre-loaded IPL 2026 player pool with base prices | ❌ Missing | Only 10 hardcoded names |
| 7 | Player base price field | ❌ Missing | Not in schema |
| 8 | Player pool status: Upcoming/Live/Sold/Unsold | ❌ Missing | No auction state per player |
| 9 | **Automated auction engine (core)** | ❌ Missing | Entirely absent |
| 10 | Server-side bid timer authority | ❌ Missing | No timer system |
| 11 | WebSocket real-time sync (bids, timer ticks) | ❌ Missing | Using polling only |
| 12 | Bid validation: purse check, role limits, squad full | ❌ Partial | Only squad-full check (was broken) |
| 13 | Bid conflict resolution (server timestamp) | ❌ Missing | No bid system |
| 14 | Idempotent bid handling (double-tap prevention) | ❌ Missing | No bid system |
| 15 | Reconnect / state replay on rejoin | ❌ Missing | No session recovery |
| 16 | Squad sidebar visible during auction | ❌ Missing | No live auction UI |
| 17 | All-teams purse tracker during auction | ❌ Missing | No live purse display |
| 18 | Unsold pool re-entry round | ❌ Missing | No unsold system |
| 19 | Post-auction squad export (PDF/link) | ❌ Missing | Not implemented |
| 20 | Match-wise score breakdown per team | ❌ Missing | Only total points shown |
| 21 | Cricbuzz v2 API integrated for player stats | ❌ Missing | Flask API exists but not wired to scoring |
| 22 | DB migration / seed script for IPL 2026 player pool | ❌ Missing | No seed script |
| 23 | Proper DB schema for auction state machine | ❌ Partial | Schema outdated vs requirements |
| 24 | Phone/Google login | ❌ Missing | Email/password only |
| 25 | Notifications (outbid, match score, auction start) | ❌ Missing | No notification system |

---

## Flask API Capabilities (from `/api/app.py`)

| Endpoint | Data Available | Used By |
|----------|---------------|---------|
| `GET /v2/scorecard/<match_id>` | Full batting+bowling scorecard, result, toss, playing XI | Points calculation |
| `GET /v2/commentary/<match_id>` | Last ~2 overs ball-by-ball | Live feed |
| `GET /v2/full-commentary/<match_id>/<innings_id>` | Full ball-by-ball innings | Detailed scoring |
| `GET /v2/overs/<match_id>/<innings_id>/<over>` | Single over commentary | Over summary |
| `GET /v2/highlights/<match_id>/<innings_id>` | Key events: 4s, 6s, wickets, milestones | Points triggers |
| `GET /get_all_matches` | All IPL match IDs (from match_ids.json) | Match schedule |
| `GET /v2/ipl2026_squads` | All 10 IPL 2026 team squads (~242 players) with Cricbuzz IDs, roles, profile URLs | Player pool seed enrichment |

**Key data fields available from scorecard:**
- Batting: `name, runs, balls, fours, sixes, sr, dismissal`
- Bowling: `name, overs, maidens, runs, wicket, economy`
- Match: `result, toss, playing_eleven`

---

## Proposed DB Schema (New / Updated)

### Collections to Add or Modify

```
users               → add: invitedRooms[], phoneNumber (optional)
auctionRooms        → add: inviteCode, auctionConfig{}, auctionState{}, 
                           status extended to 7 states (see state machine)
teams               → add: budgetAllocated, isReady (pre-auction flag), 
                           roleCounts{batsmen, bowlers, allrounders, wk}
playerPool          → add: basePrice, country, iplTeam2026, role, 
                           auctionStatus per room
auctionSession      → NEW: tracks live auction — currentPlayerIdx, 
                           currentPrice, currentWinner, timerExpiry, bidLog[]
bids                → NEW: all bids per auction player slot
liveMatches         → add: cricbuzzMatchId (for v2 API)
playerStats         → add: matchBreakdown[] for per-match leaderboard
```

---

## Task List (Chronological Implementation Order)

Each task is **full-stack** — backend + frontend changes together.  
Copy the **Prompt** column as-is when instructing the AI.

---

### PHASE 1 — Foundation & DB

---

#### Task 1: DB Schema Migration & IPL 2026 Player Seed ✅ COMPLETE

**What it does:**  
- Updates MongoDB schema for all collections  
- Adds `inviteCode`, `auctionConfig`, `auctionState` to rooms  
- Adds `basePrice`, `country`, `auctionStatus` to playerPool  
- Creates new `auctionSession` and `bids` collections with indexes  
- Seeds full IPL 2026 player roster (all 10 teams, ~250 players) with base prices into `playerPool`  
- Seeds IPL 2026 match schedule into `liveMatches` from `match_ids.json`  

**Files touched:** `db/schema.js`, `db/database.js`, new `db/migrate.js`, new `db/seeds/ipl2026Players.js`, new `db/seeds/ipl2026Matches.js`  
**Frontend impact:** None (backend only)

> **Prompt:**
> ```
> Create a DB migration and seed system for the IPL Auction app.
> 1. Update db/schema.js to add: inviteCode + auctionConfig (bidIncrement, bidTimer, nominationOrder, unsoldRule, roleComposition) to auctionRooms; basePrice + country + auctionStatus fields to playerPool; new auctionSession collection schema; new bids collection schema.
> 2. Create db/migrate.js script that when run with `node db/migrate.js` applies all schema changes and creates new indexes for auctionSession and bids collections.
> 3. Create db/seeds/ipl2026Players.js with the full IPL 2026 player roster — all 10 teams (MI, CSK, RCB, KKR, DC, PBKS, RR, SRH, LSG, GT), ~25 players per team, with fields: playerName, iplTeam, role (Batsman/Bowler/AllRounder/WicketKeeper), country, basePrice (in Cr, e.g. 0.5 / 1 / 2), cricbuzzName (for scorecard matching).
> 4. Create db/seeds/ipl2026Matches.js that reads api/match_ids.json and inserts all matches into liveMatches collection.
> 5. Create a single db/seed.js entry point that runs both seeds. Running `node db/seed.js` should be idempotent (upsert, not duplicate).
> Do not touch any frontend files.
> ```

---

#### ✅ Task 2: Room Config — Invite Code + Auction Settings

**What it does:**  
- Backend: generates 6-digit alphanumeric `inviteCode` on room creation; stores `auctionConfig` (bidIncrement, bidTimer, nominationOrder, unsoldRule, roleComposition); adds `GET /api/rooms/join/:inviteCode` endpoint  
- Frontend: adds invite code display on room page with copy button; adds join-by-code input on dashboard; adds auction config fields to create-room modal  

**Files touched:** `routes/auctionRoutes.js`, `services/auctionService.js`, `db/schema.js`, `frontend/public/index.html`, `frontend/public/js/pages/dashboard.js`, `frontend/public/js/pages/room.js`, `frontend/public/js/api.js`

> **Prompt:**
> ```
> Add room invite code and auction configuration to the IPL Auction app.
> Backend:
> 1. In services/auctionService.js createRoom(), auto-generate a unique 6-character alphanumeric inviteCode and store it with the room.
> 2. Store auctionConfig object on the room: { bidIncrement: Number (Cr), bidTimerSeconds: Number, nominationOrder: 'random'|'base_price_desc', unsoldRule: 'skip'|'reenter', roleComposition: { minBatsmen, maxBatsmen, minBowlers, maxBowlers, minAllRounders, maxAllRounders, minWK, maxWK } }.
> 3. Add GET /api/rooms/join/:inviteCode route that looks up room by inviteCode and returns room details + roomId.
> 4. Add the inviteCode field to the room response in all GET /api/rooms and GET /api/rooms/:id responses.
> Frontend:
> 5. In the create-room modal (index.html), add fields for: Bid Increment (Cr), Bid Timer (seconds), Nomination Order (dropdown), Unsold Rule (dropdown), and basic role composition (min/max per role).
> 6. On the room details page (room.js), display the invite code prominently with a copy-to-clipboard button.
> 7. On the dashboard page (dashboard.js), add a "Join by Code" input + button that calls the new endpoint and navigates to that room.
> 8. Update api.js to add joinRoomByCode(inviteCode) method.
> ```

---

### PHASE 2 — Player Pool UI

---

#### ✅ Task 3: Player Pool Page — COMPLETE

**What it does:**  
- Backend: adds `GET /api/rooms/:roomId/players` endpoint returning full player pool with per-room auction status (available/sold/unsold)  
- Frontend: new `playerPool.js` page showing all IPL 2026 players with role filter, team filter, search, and status badges; accessible from room page  

**Files touched:** `routes/auctionRoutes.js`, `services/auctionService.js`, new `frontend/public/js/pages/playerPool.js`, `frontend/public/index.html`, `frontend/public/js/app.js`, `frontend/public/js/api.js`, new `frontend/public/css/playerPool.css`

**Implemented:**
- Added `GET /api/rooms/:roomId/players` with `role`, `iplTeam`, `search`, and `status` filters.
- Implemented room-scoped auction status mapping (`available`, `sold`, `unsold`) and sold metadata (`soldToTeamName`, `soldPrice`).
- Added full Player Pool UI page at `#pool/:roomId` with filter bar, search, status badges, sold details, and back navigation.
- Added room-page `View Player Pool` button and `API.getPlayerPool(roomId, filters)` client method.

> **Prompt:**
> ```
> Create a Player Pool page for the IPL Auction app.
> Backend:
> 1. Add GET /api/rooms/:roomId/players endpoint in auctionRoutes.js that returns all players from the playerPool collection. Each player should include their auctionStatus for this room: 'available', 'sold' (with soldTo teamName and soldPrice), or 'unsold'. Support query params: role, iplTeam, search (name).
> Frontend:
> 2. Create frontend/public/js/pages/playerPool.js with a PlayerPoolPage class that:
>    - Loads and displays all players in a grid/table
>    - Filter bar: by role (All/Batsman/Bowler/AllRounder/WicketKeeper), by IPL team, by status
>    - Search input filtering by player name
>    - Each player card shows: name, role, team, country, base price, and a status badge (Available/Sold/Unsold)
>    - Sold players show "Sold to [Team] @ ₹X Cr"
> 3. Add a playerPool template in index.html.
> 4. Add a css/playerPool.css file for the page.
> 5. Register #pool/:roomId route in app.js.
> 6. Add a "View Player Pool" button on the room details page (room.js) linking to this page.
> 7. Add getPlayerPool(roomId, filters) method to api.js.
> ```

---

### PHASE 3 — WebSocket Infrastructure

---

#### ✅ Task 4: Socket.io Setup (Backend + Frontend) — COMPLETE

**What it does:**  
- Backend: installs and configures Socket.io on the Express server; defines room-scoped namespaces; sets up basic event emitter service `services/socketService.js`  
- Frontend: adds Socket.io client script to index.html; creates `js/socket.js` wrapper  
- No auction logic yet — just the connection layer  

**Files touched:** `package.json`, `server.js`, new `services/socketService.js`, `frontend/public/index.html`, new `frontend/public/js/socket.js`

**Implemented:**
- Installed `socket.io` (backend) and `socket.io-client` (frontend workspace).
- Upgraded backend startup to `http.createServer(app)` + `new Server(httpServer, cors...)`.
- Added `services/socketService.js` with `joinRoom`, `leaveRoom`, `emitToRoom`, `emitToSocket`, `getRoomSockets`.
- Added socket events in `server.js`: `join-auction-room`, `leave-auction-room`, `disconnect`.
- Implemented JWT validation for socket room joins and emitted `room-state` snapshots to reconnecting clients.
- Added frontend SocketService singleton in `frontend/public/js/socket.js` and registered socket scripts in `index.html`.

> **Prompt:**
> ```
> Set up Socket.io real-time infrastructure for the IPL Auction app. No auction logic yet — just the connection layer.
> Backend:
> 1. npm install socket.io in the root project.
> 2. In server.js, upgrade from app.listen to http.createServer + io = new Server(httpServer, { cors: { origin: 'http://localhost:8000' } }).
> 3. Create services/socketService.js that exports: joinRoom(socket, roomId), leaveRoom(socket, roomId), emitToRoom(roomId, event, data), emitToSocket(socketId, event, data), getRoomSockets(roomId).
> 4. In server.js io.on('connection'), handle: 'join-auction-room' event (client sends roomId+token, server validates JWT, adds socket to room channel), 'leave-auction-room' event, 'disconnect' event.
> 5. On reconnect, emit 'room-state' event back to that single socket with current room state.
> Frontend:
> 6. npm install socket.io-client in the frontend folder.
> 7. Create frontend/public/js/socket.js with a SocketService class: connect(token), joinRoom(roomId), leaveRoom(roomId), on(event, callback), emit(event, data), disconnect(). Store as singleton.
> 8. Add the socket.io-client script reference in index.html before other JS files.
> Do NOT change any page logic yet — just establish the connection infrastructure.
> ```

---

### PHASE 4 — Auction Engine (Core)

---

#### Task 5: Auction State Machine (Backend)

**What it does:**  
- Backend: implements the full auction engine in `services/auctionEngine.js`; manages state transitions (ROOM_SETUP → WAITING → AUCTION_LIVE → PLAYER_NOMINATED → BIDDING_OPEN → PLAYER_SOLD/UNSOLD → NEXT_PLAYER → AUCTION_COMPLETE); server-side countdown timer using `auctionSession` collection; stores all bids in `bids` collection  
- Adds routes: `POST /api/rooms/:roomId/auction/start`, `POST /api/rooms/:roomId/auction/ready`, `GET /api/rooms/:roomId/auction/state`  
- All state changes broadcast via Socket.io events  
- No frontend changes yet  

**Files touched:** new `services/auctionEngine.js`, `routes/auctionRoutes.js`, `db/database.js`, `services/socketService.js`

> **Prompt:**
> ```
> Build the automated auction engine (backend only) for the IPL Auction app.
> 1. Create services/auctionEngine.js implementing the full auction state machine:
>    States: ROOM_SETUP, WAITING_FOR_PARTICIPANTS, AUCTION_LIVE, PLAYER_NOMINATED, BIDDING_OPEN, PLAYER_SOLD, PLAYER_UNSOLD, UNSOLD_REENTRY, AUCTION_COMPLETE.
> 2. Functions to implement:
>    - setReady(roomId, userId): marks a participant as ready; when all participants ready → emit 'all-ready' event.
>    - startAuction(roomId, userId): validates all ready; builds player nomination queue per auctionConfig.nominationOrder; creates auctionSession document; emits 'auction-started'.
>    - nominateNextPlayer(roomId): picks next player from queue; sets state to BIDDING_OPEN; sets server-side timer using setTimeout; emits 'player-nominated' with player card + timer duration.
>    - placeBid(roomId, userId, amount): validates bid (purse check, role composition check, squad full check, not current highest bidder, amount = currentPrice + bidIncrement); records bid in bids collection with server timestamp; updates auctionSession.currentPrice and currentWinner; resets timer; emits 'bid-placed'.
>    - handleTimerExpiry(roomId): if currentWinner exists → PLAYER_SOLD (assign player to team, deduct purse, emit 'player-sold'); else → PLAYER_UNSOLD (add to unsold pool, emit 'player-unsold'); wait 3 seconds then call nominateNextPlayer.
>    - handleAuctionEnd(roomId): if unsoldRule=reenter and unsoldPool not empty → run UNSOLD_REENTRY round at 50% base price; else emit 'auction-complete' with all squad summaries.
> 3. Idempotent bid: if same userId submits bid twice within 500ms, only process first.
> 4. Add routes in auctionRoutes.js:
>    - POST /api/rooms/:roomId/auction/ready — mark self as ready
>    - POST /api/rooms/:roomId/auction/start — trigger auction (only valid when all ready)
>    - POST /api/rooms/:roomId/auction/bid — place a bid { amount }
>    - GET /api/rooms/:roomId/auction/state — return full current auctionSession state
> 5. All state changes must emit Socket.io events via socketService to the room channel.
> Do not touch any frontend files.
> ```

---

#### Task 6: Live Auction UI (Frontend)

**What it does:**  
- Frontend: new `auctionLive.js` page — the central auction screen; shows current player card, countdown timer, bid button, current price, highest bidder, all-teams purse sidebar, own squad sidebar; connects via Socket.io and updates in real-time  
- Connects to auction state machine via both REST (initial state) and Socket.io (live updates)  

**Files touched:** new `frontend/public/js/pages/auctionLive.js`, `frontend/public/index.html`, `frontend/public/js/app.js`, `frontend/public/js/api.js`, `frontend/public/js/socket.js`, new `frontend/public/css/auctionLive.css`

> **Prompt:**
> ```
> Build the Live Auction page (frontend) for the IPL Auction app.
> 1. Create frontend/public/js/pages/auctionLive.js with an AuctionLivePage class:
>    Layout (3-panel):
>    - LEFT sidebar: own team's squad (players won so far + remaining purse)
>    - CENTER main: current player card (name, role, team, country, base price), countdown timer ring, current price display, highest bidder name, BID button
>    - RIGHT sidebar: all teams' remaining purse tracker
>    BID button behavior: disabled if not eligible (purse too low, squad full, role limit, currently highest bidder); shows ineligibility reason as tooltip.
> 2. Socket.io events to handle (via SocketService):
>    - 'player-nominated': update center panel with new player card, reset timer display, enable BID button
>    - 'bid-placed': update current price + highest bidder; if I was highest bidder → show "OUTBID" flash
>    - 'timer-tick': update countdown ring (server sends remaining seconds every second)
>    - 'player-sold': flash sold banner with price + winning team; update all sidebars
>    - 'player-unsold': flash "UNSOLD" banner; update pool status
>    - 'auction-complete': navigate to auction summary page
>    - 'room-state': on reconnect, restore full UI state from server snapshot
> 3. REST calls on page init: GET /api/rooms/:roomId/auction/state to hydrate initial state.
> 4. BID button click: emit 'place-bid' via socket (not REST); show optimistic "bid sent" state.
> 5. Add template in index.html and register #auction/:roomId route in app.js.
> 6. Create css/auctionLive.css: mobile-first, stacked on small screens, 3-column on desktop. Timer ring as SVG circle stroke-dashoffset animation. Highlight own team's purse row.
> 7. Add readyUp(roomId) and getAuctionState(roomId) methods to api.js.
> 8. On the room details page (room.js), add "Mark Ready" button (calls readyUp API) and "Enter Auction" button (navigates to #auction/:roomId) — show when auctionState is WAITING_FOR_PARTICIPANTS or AUCTION_LIVE.
> ```

---

#### Task 7: Ready-Up Flow & Auction Start UI

**What it does:**  
- Frontend: room page shows participant list with ready/not-ready status; "Mark as Ready" button; real-time ready count via Socket.io; "Start Auction" fires once all are ready  
- Backend: validates all participants ready before allowing start  

**Files touched:** `frontend/public/js/pages/room.js`, `frontend/public/css/room.css`, `routes/auctionRoutes.js`

> **Prompt:**
> ```
> Implement the ready-up flow for the IPL Auction app.
> Backend:
> 1. Add a readyParticipants[] array to auctionRooms collection.
> 2. POST /api/rooms/:roomId/auction/ready: adds userId to readyParticipants; when readyParticipants.length === participants.length, emit socket event 'all-participants-ready' to the room.
> 3. GET /api/rooms/:roomId returns readyParticipants[] in the response.
> Frontend (room.js):
> 4. Show each participant as a row with a green ✓ or grey ○ ready indicator.
> 5. Show "Mark as Ready" button for current user if they haven't readied up.
> 6. Listen for 'participant-ready' socket event to update indicators in real-time without page refresh.
> 7. When 'all-participants-ready' received: show "Auction is starting..." banner, then auto-navigate to #auction/:roomId after 2 seconds.
> 8. If auctionState is already AUCTION_LIVE (user joins mid-auction), show "Auction in progress" with direct "Join Auction" button.
> Update room.css for the ready indicator styling.
> ```

---

### PHASE 5 — Scoring Integration

---

#### Task 8: Wire Flask API to Points Calculator

**What it does:**  
- Backend: updates `services/pointsCalculator.js` to call the Flask v2 scorecard API (`/v2/scorecard/<match_id>`) and `/v2/highlights/<match_id>/<innings_id>` instead of hardcoded data; maps batting/bowling fields from the Flask response to the existing points formula  
- Adds `cricbuzzMatchId` field to liveMatches; updates match sync to use it  

**Files touched:** `services/pointsCalculator.js`, `services/liveUpdater.js`, `db/schema.js`, `routes/liveRoutes.js`

> **Prompt:**
> ```
> Wire the Flask scorecard API to the points calculator in the IPL Auction app.
> 1. In services/pointsCalculator.js, replace any placeholder/hardcoded data fetching with actual calls to the Flask API at http://localhost:5000:
>    - Use GET /v2/scorecard/<match_id> to get full batting + bowling scorecard
>    - Use GET /v2/highlights/<match_id>/<innings_id> to get key events (fours, sixes, wickets) for bonus calculations
>    - Map Flask response fields to points formula: batting (runs, balls, fours, sixes, sr, dismissal), bowling (overs, maidens, runs, wicket, economy)
> 2. T20 points formula to implement (if not already correct):
>    Batting: run=1pt, four bonus=1pt, six bonus=2pt, 50=8pt, 100=16pt, duck=-2pt, SR>170(min10b)=6pt, SR140-170=4pt, SR<70=-6pt
>    Bowling: wicket=25pt, 3W=4pt, 4W=8pt, 5W=16pt, maiden=8pt, Economy<5=6pt, 5-6=4pt, 7-8=0, 8-9=-2pt, >10=-4pt
>    Fielding: catch=8pt, stumping=12pt, runout=6pt
> 3. Add cricbuzzMatchId field to liveMatches schema and seed it from match_ids.json.
> 4. In services/liveUpdater.js, when syncing a match, look up cricbuzzMatchId from liveMatches and pass it to pointsCalculator.
> 5. After points are calculated, emit socket event 'leaderboard-updated' to all rooms that have this match active, so frontends update in real-time.
> Do not change any frontend files.
> ```

---

#### Task 9: Match-Wise Score Breakdown Page

**What it does:**  
- Backend: adds `GET /api/rooms/:roomId/teams/:teamId/breakdown` returning per-match points breakdown  
- Frontend: team page gets a "Match Breakdown" tab showing a table of match-by-match points per player  

**Files touched:** `routes/teamRoutes.js`, `services/teamService.js`, `frontend/public/js/pages/team.js`, `frontend/public/css/team.css`

> **Prompt:**
> ```
> Add match-wise score breakdown to the team page in the IPL Auction app.
> Backend:
> 1. Add GET /api/rooms/:roomId/teams/:teamId/breakdown endpoint that returns per-match points for each player in the team. Response: array of { matchId, matchName, matchDate, players: [{ playerName, battingPoints, bowlingPoints, fieldingPoints, totalPoints }], teamTotalForMatch }.
> 2. Query this from the pointsLog collection grouped by matchId.
> Frontend (team.js):
> 3. Add a tab bar to the team page: "Squad" (existing player list) | "Match Breakdown".
> 4. The Match Breakdown tab shows a table: rows = matches, columns = players, cells = points for that match, last column = team total for that match.
> 5. Add a row at the bottom for cumulative totals.
> 6. Add getTeamBreakdown(roomId, teamId) to api.js.
> Update team.css for the tab bar and breakdown table styling.
> ```

---

### PHASE 6 — Polish & Export

---

#### Task 10: Post-Auction Squad Export

**What it does:**  
- Backend: adds `GET /api/rooms/:roomId/teams/:teamId/export` returning structured JSON suitable for rendering; alternatively a shareable summary URL  
- Frontend: "Export Squad" button on team page that generates a printable summary card  

**Files touched:** `routes/teamRoutes.js`, `frontend/public/js/pages/team.js`, `frontend/public/css/team.css`

> **Prompt:**
> ```
> Add squad export to the team page in the IPL Auction app.
> Backend:
> 1. Add GET /api/rooms/:roomId/teams/:teamId/export endpoint that returns a full squad summary: { teamName, ownerName, roomName, totalBudgetAllocated, budgetSpent, budgetRemaining, totalPoints, players: [{ playerName, iplTeam, role, country, basePrice, purchasePrice, currentPoints }] }.
> Frontend (team.js):
> 2. Add an "Export / Share" button on the team page.
> 3. On click, fetch the export endpoint and render a printable summary card in a modal: team name, owner, room, budget summary, player roster table with purchase prices and current points.
> 4. Add a "Print" button inside the modal (calls window.print()).
> 5. Add a "Copy Link" button that copies a shareable URL: http://localhost:8000/#team/:roomId/:teamId to clipboard.
> 6. Add exportTeam(roomId, teamId) to api.js.
> Update team.css for the export modal print styles (@media print).
> ```

---

#### Task 11: In-App Notifications

**What it does:**  
- Backend: Socket.io already emits events; no new backend needed  
- Frontend: notification center icon in navbar; stores unread notifications in memory; shows badge count; dropdown lists recent notifications  
- Sources: outbid events, match score updates, auction-starting alerts, participant-joined alerts  

**Files touched:** `frontend/public/index.html`, `frontend/public/js/utils.js`, new `frontend/public/js/notifications.js`, `frontend/public/css/style.css`

> **Prompt:**
> ```
> Add an in-app notification centre to the IPL Auction app frontend.
> 1. Create frontend/public/js/notifications.js with a NotificationService class:
>    - Maintains an in-memory array of notifications: { id, type, message, timestamp, read }
>    - Types: 'outbid', 'score-update', 'auction-starting', 'player-sold', 'auction-complete'
>    - Methods: add(type, message), markRead(id), markAllRead(), getUnread(), getAll()
>    - Listen to SocketService events: 'bid-placed' (if I was highest bidder → outbid), 'leaderboard-updated' (score update), 'all-participants-ready' (auction starting), 'player-sold', 'auction-complete'
> 2. In index.html navbar, add a bell icon 🔔 with a badge span showing unread count.
> 3. Clicking the bell opens a dropdown panel listing recent notifications with timestamps.
> 4. Each notification has a dismiss (×) button.
> 5. Style the badge and dropdown in style.css.
> 6. Import and initialise NotificationService in app.js after socket connection is established.
> ```

---

#### Task 12: Leaderboard Real-Time Update via Socket

**What it does:**  
- Replaces polling on the leaderboard page with Socket.io `leaderboard-updated` event  
- Keeps polling as fallback if socket disconnects  

**Files touched:** `frontend/public/js/pages/leaderboard.js`

> **Prompt:**
> ```
> Replace leaderboard polling with Socket.io real-time updates in the IPL Auction app.
> 1. In frontend/public/js/pages/leaderboard.js:
>    - On page init, call SocketService.joinRoom(roomId) and listen for 'leaderboard-updated' event.
>    - When 'leaderboard-updated' is received, call loadLeaderboard() to refresh the table.
>    - Keep the existing polling (5-second interval) as fallback only — only start polling if SocketService.isConnected() returns false.
>    - On page destroy (navigation away), call SocketService.leaveRoom(roomId) and stop polling.
> 2. Show a "LIVE" green indicator badge next to the page title when socket is connected, "Polling" amber badge when falling back to polling.
> 3. No backend changes needed.
> ```

---

## Execution Order Summary

| Phase | Task | Prompt Trigger | Backend | Frontend | Priority |
|-------|------|----------------|---------|----------|----------|
| 1 | Task 1: DB Migration + Seed | ✅ Complete | ✅ | ❌ | ~~Must-do first~~ Done |
| 1 | Task 2: Invite Code + Room Config | `Add room invite code and auction configuration...` | ✅ | ✅ | **Must-do first** |
| 2 | Task 3: Player Pool Page | `Create a Player Pool page...` | ✅ | ✅ | Before auction |
| 3 | Task 4: Socket.io Setup | `Set up Socket.io real-time infrastructure...` | ✅ | ✅ | Before auction |
| 4 | Task 5: Auction Engine | `Build the automated auction engine (backend only)...` | ✅ | ✅ | Core feature |
| 4 | Task 6: Live Auction UI | `Build the Live Auction page (frontend)...` | ✅ | ✅ | Core feature |
| 4 | Task 7: Ready-Up Flow | `Implement the ready-up flow...` | ✅ | ✅ | Core feature |
| 5 | Task 8: Flask → Points | `Wire the Flask scorecard API to the points calculator...` | ✅ | ✅ | Scoring |
| 5 | Task 9: Match Breakdown | `Add match-wise score breakdown to the team page...` | ✅ | ✅ | Scoring |
| 6 | Task 10: Squad Export | `Add squad export to the team page...` | ✅ | ✅ | Polish |
| 6 | Task 11: Notifications | `Add an in-app notification centre...` | ✅ | ✅ | Polish |
| 6 | Task 12: Socket Leaderboard | `Replace leaderboard polling with Socket.io...` | ✅ | ✅ | Polish |

---

**🎉 ALL TASKS COMPLETE! — All 12 tasks fully implemented and integrated.**

*Tasks 1–2 unblock everything else. Tasks 3–4 must be done before Tasks 5–7. Tasks 5+6+7 must all be completed together for the auction to work end-to-end.*
