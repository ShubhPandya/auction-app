# Virtual IPL Auction System - Setup & Usage Guide

## 🏏 Overview

A complete virtual auction platform where users create auction rooms, draft real IPL players into teams, and accumulate points live during matches based on player performance.

---

## 📋 Prerequisites

- **Node.js** v14+ (tested on v24)
- **MongoDB** (local or cloud)
- **Python** 3.8+ (for Cricbuzz API scraping)
- **npm** packages (see `package.json`)

---

## 🚀 Installation

### 1. Install Node Dependencies

```bash
cd c:\Projects\AuctionApp
npm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
# Start MongoDB service
mongod

# Verify connection
mongo
```

**Option B: MongoDB Atlas (Cloud)**
```
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and get connection string
3. Update MONGO_URL in .env file
```

### 3. Configure Environment

Edit `.env` file:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=ipl-auction
PORT=3000
JWT_SECRET=your-secret-key
```

### 4. Start Flask API (in another terminal)

```bash
cd c:\Projects\AuctionApp\api
python api/app.py
# Runs on http://localhost:5000
```

### 5. Start Node Server

```bash
cd c:\Projects\AuctionApp
npm run server
# Server runs on http://localhost:3000
```

---

## 📝 System Architecture

```
┌─────────────────────────────────────────┐
│        Virtual Auction Rooms            │
│  (User creates auction sessions)        │
└────────────────────┬────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌──────┐   ┌─────────┐  ┌──────────┐
    │Teams │   │ Players │  │  Points  │
    │(11ea)│   │ (Draft) │  │  System  │
    └──────┘   └─────────┘  └──────────┘
        │            │            │
        └────────────┼────────────┘
                     │
        ┌────────────▼────────────┐
        │  Live Match Sync        │
        │  (Cricbuzz API)         │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Points Accumulator     │
        │  (Based on points_sys) │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Leaderboard & Stats    │
        │  (Real-time updates)    │
        └────────────────────────┘
```

---

## 🎮 Workflow

### **Step 1: User Registration & Login**

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "email": "user1@example.com",
    "password": "password123"
  }'

# Response:
{
  "status": "success",
  "data": {
    "userId": "...",
    "token": "eyJhbGc..."
  }
}

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123"
  }'
```

### **Step 2: Create Auction Room**

```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "IPL 2026 Auction Room",
    "description": "Private auction with friends",
    "budgetPerTeam": 100,
    "maxPlayersPerTeam": 11,
    "startDate": "2026-04-16",
    "endDate": "2026-06-30"
  }'

# Response:
{
  "status": "success",
  "data": {
    "_id": "roomId123",
    "name": "IPL 2026 Auction Room",
    "status": "draft",
    "participants": [userId],
    "teams": []
  }
}
```

### **Step 3: Other Users Join Room**

```bash
curl -X POST http://localhost:3000/api/rooms/roomId123/join \
  -H "Authorization: Bearer USER2_TOKEN"
```

### **Step 4: Create Teams**

```bash
# User 1 creates team
curl -X POST http://localhost:3000/api/rooms/roomId123/teams \
  -H "Authorization: Bearer USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teamName": "Mumbai Maharajas",
    "budgetAllocated": 100
  }'

# Response:
{
  "status": "success",
  "data": {
    "_id": "teamId1",
    "teamName": "Mumbai Maharajas",
    "owner": "user1",
    "players": [],
    "totalPoints": 0,
    "budgetSpent": 0
  }
}
```

### **Step 5: Draft Players to Team**

```bash
curl -X POST http://localhost:3000/api/rooms/roomId123/teams/teamId1/players \
  -H "Authorization: Bearer USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player123",
    "playerName": "Virat Kohli",
    "iplTeam": "RCB",
    "role": "batsman"
  }'

# Repeat for all 11 players
```

### **Step 6: Get Active Matches**

```bash
curl -X GET http://localhost:3000/api/matches/active
```

### **Step 7: Start Live Sync for Match**

```bash
curl -X POST http://localhost:3000/api/matches/35612/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startContinuousSync": true,
    "syncIntervalSeconds": 60
  }'

# Now system will:
# 1. Fetch live data from Cricbuzz API every 60s
# 2. Calculate points for each player
# 3. Update team scores automatically
# 4. Broadcast new leaderboard
```

### **Step 8: View Live Leaderboard**

```bash
curl -X GET http://localhost:3000/api/rooms/roomId123/leaderboard

# Response:
{
  "status": "success",
  "data": {
    "roomId": "roomId123",
    "teams": [
      {
        "_id": "teamId1",
        "teamName": "Mumbai Maharajas",
        "totalPoints": 342,
        "rank": 1,
        "players": [...]
      },
      {
        "_id": "teamId2",
        "teamName": "Delhi Daredevils",
        "totalPoints": 298,
        "rank": 2,
        "players": [...]
      }
    ]
  }
}
```

---

## 🔧 Core Services

### **1. Auction Service** (`services/auctionService.js`)
- Create/manage auction rooms
- Add/remove participants
- Track active matches

### **2. Team Service** (`services/teamService.js`)
- Create teams
- Draft/remove players
- Manage team budget
- Calculate team stats

### **3. Points Accumulator** (`services/pointsAccumulator.js`)
- Calculate points using `points_system.md` rules
- Track batting/bowling/fielding points
- Handle bonuses (50/100 runs, 3/5 wickets)

### **4. Match Sync Service** (`services/matchSyncService.js`)
- Poll Cricbuzz API every 60s
- Detect player performance changes
- Update points incrementally
- Broadcast to teams in rooms

---

## 📊 Points System (from `points_system.md`)

### **Batting**
- Run: +1
- Four: +2
- Six: +4
- 50 Runs Bonus: +5
- 100 Runs Bonus: +12

### **Bowling**
- Wicket: +25
- 3 Wickets Bonus: +8
- 5 Wickets Bonus: +15
- Dot Ball: +1
- Maiden Over: +5

### **Fielding**
- Catch: +8
- Direct Run Out: +10
- Run Out Assist: +5
- Stumping: +8

---

## 🗄️ Database Schema

### Collections:
1. **users** - User accounts and credentials
2. **auctionRooms** - Auction sessions
3. **teams** - User teams within rooms
4. **playerPool** - Available players for drafting
5. **playerStats** - Cumulative player performance
6. **liveMatches** - Current match data cache
7. **pointsLog** - Audit trail of points changes

---

## 🚨 Troubleshooting

### **MongoDB Connection Error**
```
Solution: Ensure MongoDB is running
- Windows: mongod
- Or use MongoDB Atlas connection string
```

### **API Port Already in Use**
```
Solution: Change PORT in .env or kill existing process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### **Cricbuzz API Not Responding**
```
Solution: Ensure Flask API server is running
python api/app.py
```

### **JWT Token Expired**
```
Solution: Login again to get fresh token
POST /auth/login
```

---

## 📈 Future Enhancements

1. **WebSocket Support** - Real-time leaderboard updates
2. **Player Pool from API** - Dynamic player list from live matches
3. **Budget Constraints** - Auction-style budget management
4. **Match Commentary** - Ball-by-ball commentary integration
5. **User Dashboard** - Personal stats and history
6. **Mobile App** - React Native or Flutter client
7. **Admin Panel** - Manage rooms, users, and data
8. **Historical Data** - Archive past auctions and stats

---

## 🤝 Contributing

To add features:
1. Create new service in `services/`
2. Add routes in `routes/`
3. Update database schema in `db/schema.js`
4. Test with curl or Postman

---

## 📄 API Documentation

See `api/postman_collection.json` for complete Postman collection.

Key Endpoints:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /api/rooms` - Create auction room
- `GET /api/rooms/:roomId/leaderboard` - Live leaderboard
- `POST /api/matches/:matchId/sync` - Start live sync
- `GET /api/rooms/:roomId/teams/:teamId/stats` - Team stats

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review MongoDB connection
3. Verify Cricbuzz API is accessible
4. Check token validity
5. Review console logs for errors

---

**Happy Auctioning! 🏏**
