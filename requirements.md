# Fantasy Cricket — Automated Auction Platform
## Product Requirements Document

**Inspired by:** auctionroom.in  
**Key Differentiator:** Fully automated, hostless auction — the app conducts the auction itself  
**Category:** Fantasy Cricket · Automated Auction  
**Version:** 1.1  
**Date:** April 2026

---

## 1. Product Overview

A web-based fantasy cricket platform where groups of friends join a room, configure squad rules, and participate in an **app-driven IPL-style auction** — no human host required. The app automatically surfaces players one by one, manages the countdown timer, accepts bids from participants, resolves the auction for each player, and advances to the next. Every participant is a bidder; no one is the auctioneer.

**Core distinction from AuctionRoom.in:** AuctionRoom relies on a designated host to verbally conduct the auction and manually advance players. This platform eliminates that role entirely — the engine is the auctioneer.

---

## 2. Target Users

| Persona | Description |
|---|---|
| Room Creator | Any participant who sets up the room; no elevated auction-control privileges beyond pre-start config |
| Team Owner / Bidder | Every participant; bids in real-time against others |
| Spectator *(optional)* | Invited viewer with no bidding rights; watch-only mode |

**Primary demographic:** Friend groups, office leagues, college circles — 4 to 16 participants per room.

> No "Host" persona. The room creator's only elevated action is configuring and launching the room. Once the auction starts, the app drives everything.

---

## 3. Core Feature Modules

### 3.1 Room Setup
- Any user can create a room and receive a shareable invite code/link
- Pre-start configuration (room creator sets once, locked after auction start):
  - Tournament / player pool (IPL 2026, T20 WC, etc.)
  - Number of teams (must match joined participants)
  - Virtual purse per team (e.g., ₹100 Cr)
  - Squad size (total slots + per-role minimums/maximums)
  - Bid increment step (e.g., ₹0.5 Cr)
  - Bid window duration per player (e.g., 15s countdown)
  - Player nomination order: random shuffle or base-price descending
  - Unsold player rule: skip permanently or re-enter at auction end
- Participant readiness check: auction starts only when all expected team owners have joined and confirmed ready

### 3.2 Player Pool
- Pre-loaded tournament roster: Batter, Bowler, All-rounder, WK-Batter
- Player cards: name, role, country, base price, key stats snapshot
- Pool visible to all participants before and during auction (read-only)
- Real-time status per player: Upcoming / Live / Sold (₹X Cr — Team Y) / Unsold

### 3.3 Automated Auction Engine *(core module)*

The app is the auctioneer. No human participant controls the flow.

**Player nomination:**
- App selects next player automatically per the configured nomination order
- Player card surfaces to all participants simultaneously
- Bidding opens immediately at the player's base price

**Bidding mechanics:**
- Any eligible team owner taps/clicks "Bid" to place the current price + increment
- Each successful bid resets the countdown timer
- If no bid is placed before timer expires → player goes unsold (or enters unsold pool per config)
- Simultaneous bids: server timestamps resolve ties — earliest valid bid wins the increment

**Bid validation (server-enforced):**
- Team cannot bid if remaining purse < current bid amount
- Team cannot bid if squad is full (all slots filled)
- Team cannot bid if adding this player would breach role-composition rules (e.g., already at max bowlers)
- Current highest bidder cannot re-bid on the same player

**Player resolution:**
- Timer reaches zero → highest bidder wins; player assigned to their squad; purse deducted
- App broadcasts: sold card with final price + winning team name
- 3-second pause → next player surfaces automatically

**Unsold player re-entry (if enabled):**
- After all players cycled, unsold pool re-enters at reduced base price (configurable, e.g., 50% of original)
- Re-entry runs identically — app-driven, no manual intervention

**Auction end:**
- All players sold/exhausted → auction closes automatically
- Final squad summary surfaced for all participants

### 3.4 Real-Time Sync
- WebSocket connection maintained for all room participants
- Events broadcast to all clients: player nominated, bid placed, timer tick, player sold/unsold, next player
- Reconnect handling: participant drops and rejoins — current auction state replayed on reconnect
- Bid latency target: server processes and broadcasts bid event < 300ms

### 3.5 Squad & Purse Management
- Live squad view per team owner (own squad always visible in sidebar)
- All-teams purse tracker visible to everyone during auction (remaining balance per team)
- Squad validation enforced in real-time — ineligible bids blocked before submission with reason shown
- Post-auction: full squad export (PDF / shareable link)

### 3.6 Scoring & Leaderboard
- Automatic points calculation from real match performance
- T20 fantasy scoring standard: runs, boundaries, wickets, economy rate, strike rate, catches, MOM bonus
- Score updates post-match (same-day SLA target)
- Room leaderboard: total fantasy points across all tournament matches
- Match-wise breakdown per team owner

### 3.7 Notifications
- Auction start alert to all invited participants
- "You've been outbid" push/in-app notification during live auction
- Match score update alert post-game
- Reminder if a participant hasn't joined before the room is scheduled to start

---

## 4. Auction State Machine

```
ROOM_SETUP
    → WAITING_FOR_PARTICIPANTS (all owners joined + ready)
    → AUCTION_LIVE
        → [loop per player]
            PLAYER_NOMINATED
            → BIDDING_OPEN (timer starts)
                → BID_PLACED (timer resets, repeat)
                → TIMER_EXPIRED
                    → PLAYER_SOLD (purse deducted, squad updated)
                    → PLAYER_UNSOLD (added to unsold pool)
            → NEXT_PLAYER (auto-advance)
        → [if unsold pool enabled]
            UNSOLD_REENTRY_ROUND (same loop, reduced base price)
    → AUCTION_COMPLETE (all squads finalised)
```

---

## 5. Platform & Technical Requirements

| Area | Requirement |
|---|---|
| Web | Responsive web app — mobile-first (auction is primarily a phone experience) |
| Real-time | WebSocket (Socket.io or native WS) for bid events and timer sync |
| Timer authority | Server-side only — clients display server-derived state; no client-side timer manipulation possible |
| Auth | Phone OTP or Google login; room access via 6-digit invite code |
| Bid conflict resolution | Server timestamp — first valid bid received wins the increment |
| Cricket data | Tournament roster + match scoring via data provider (CricAPI, Sportmonks, or equivalent) |
| Concurrency | 4–16 simultaneous bidders per room; multiple rooms running in parallel |
| Bid broadcast latency | < 300ms from server receipt to all clients |

---

## 6. Non-Functional Requirements

- **No real money:** Virtual purse only; zero financial transactions
- **Server-side authority:** All auction state (timer, current price, winning bidder, purse balances) lives exclusively on the server. Client is a display layer — cannot manipulate state.
- **Idempotent bids:** Duplicate submissions (e.g., double-tap) handled gracefully — only one bid registered per tap
- **Graceful degradation:** Participant disconnects mid-auction → squad and purse state preserved; they rejoin and continue
- **Fairness:** Bid window is identical for all participants regardless of network position; server timestamp is the sole arbiter
- **Availability:** High uptime mandatory during IPL season (March–May); auction sessions are time-critical

---

## 7. Intentional Scope Exclusions (v1)

| Feature | Decision |
|---|---|
| Host / auctioneer role | ❌ Eliminated — app conducts auction |
| Manual player nomination by any participant | ❌ Automated per pre-set config |
| Pause / resume mid-auction | ❌ Timer is authoritative; no pause |
| Auto-bid / max-bid ceiling setting | ❌ Manual bids only (reconsider in v2) |
| Real money wagering | ❌ Virtual only |
| Live ball-by-ball scoring | ❌ Post-match updates only (v1) |

---

## 8. Open Questions

| # | Question | Priority |
|---|---|---|
| 1 | What happens if all teams' purses are exhausted before the player pool is complete? | High |
| 2 | Should participants be able to set an **auto-bid ceiling** (app bids up to max on their behalf)? | High |
| 3 | Score update SLA — target window post-match for points to reflect? | High |
| 4 | Mobile app (iOS/Android) in scope, or web-only for v1? | Medium |
| 5 | Can one user join multiple rooms simultaneously (different friend groups)? | Medium |
| 6 | How are player injuries/replacements post-auction handled? | Medium |
| 7 | Should the nomination order be shown to participants in advance, or revealed one-by-one? | Low |

---

## 9. Competitive Positioning

| Platform | Hostless Auction | App-driven Flow | Auto Scoring | Friend Rooms |
|---|---|---|---|---|
| **This App** | ✅ | ✅ | ✅ | ✅ |
| AuctionRoom.in | ❌ (verbal host) | ❌ | ✅ | ✅ |
| 11auction.com | ❌ (host required) | ❌ | ✅ | ✅ |
| MyAuctionVerse | ❌ (host required) | ❌ | ❌ | ✅ |
| Dream11 | ❌ (pick-based) | N/A | ✅ | Limited |

**Unique position:** Only platform that removes the host dependency while retaining automated real-match scoring. Zero coordination overhead — any friend group can run a full auction without nominating an auctioneer.

---

## 10. Success Metrics

| Metric | Description |
|---|---|
| Auction completion rate | % of started auctions that complete without abandonment |
| Median auction duration | Time from first player to close (target: < 45 min for 15-player squads) |
| Bid engagement rate | Avg % of players each team owner actively bids on |
| Return session rate | Users who return post-auction for leaderboard/scoring |
| Bid conflict rate | % of rounds with simultaneous bids (infra health signal) |
| Rooms per user per season | Engagement depth |

---

*PRD v1.1 — Rearchitected from AuctionRoom.in baseline to a fully hostless, app-driven auction model. All host-control references from v1.0 removed.*