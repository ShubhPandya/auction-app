# 🏏 Project Setup Complete - Virtual IPL Auction System

**Setup Date:** April 16, 2026  
**Status:** ✅ **ALL SYSTEMS RUNNING**

---

## 📋 Setup Summary

Your Virtual IPL Auction System is now fully configured and running. Here's what has been set up:

### **Services Status**

| Service | Port | Status | Command |
|---------|------|--------|---------|
| **MongoDB** | 27017 | ✅ Running | Windows Service (MongoDB) |
| **Flask API** | 5000 | ✅ Running | `cd api && python app.py` |
| **Express Server** | 3000 | ✅ Running | `npm run server` |

---

## 🚀 Quick Start Guide

### **Already Running (Keep These Open)**

You have **3 terminal windows** running:

1. **Terminal 1** - MongoDB Service (Windows Service - automatic)
2. **Terminal 2** - Flask API Server (running at `http://localhost:5000`)
3. **Terminal 3** - Express Node Server (running at `http://localhost:3000`)

### **To Test the System**

Open a **4th terminal** and test the API:

```powershell
# Test server is running
Invoke-WebRequest -Uri http://localhost:3000/ -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

## 📝 Next Steps - How to Use the System

### **Step 1: Register a User**

```powershell
$body = @{
    username = "user1"
    email = "user1@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/auth/register `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "userId": "...",
    "token": "eyJhbGc..."
  }
}
```

💾 **Save the token for next requests!**

---

### **Step 2: Create an Auction Room**

```powershell
$token = "YOUR_TOKEN_HERE"

$body = @{
    name = "IPL 2026 Auction"
    description = "Main auction room"
    budgetPerTeam = 100
    maxPlayersPerTeam = 11
    startDate = "2026-04-16"
    endDate = "2026-06-30"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/rooms `
  -Method Post `
  -Headers @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
  } `
  -Body $body `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "roomId123",
    "name": "IPL 2026 Auction",
    "status": "draft"
  }
}
```

💾 **Save the roomId!**

---

### **Step 3: Create a Team**

```powershell
$roomId = "YOUR_ROOM_ID_HERE"
$token = "YOUR_TOKEN_HERE"

$body = @{
    teamName = "Mumbai Maharajas"
    budgetAllocated = 100
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/rooms/$roomId/teams `
  -Method Post `
  -Headers @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
  } `
  -Body $body `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

### **Step 4: Add Players to Team**

```powershell
$roomId = "YOUR_ROOM_ID_HERE"
$teamId = "YOUR_TEAM_ID_HERE"
$token = "YOUR_TOKEN_HERE"

$body = @{
    playerId = "player123"
    playerName = "Virat Kohli"
    iplTeam = "RCB"
    role = "batsman"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/rooms/$roomId/teams/$teamId/players `
  -Method Post `
  -Headers @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
  } `
  -Body $body `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

### **Step 5: View Live Leaderboard**

```powershell
$roomId = "YOUR_ROOM_ID_HERE"

Invoke-WebRequest -Uri http://localhost:3000/api/rooms/$roomId/leaderboard `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

## 🔧 Project Structure

```
c:\Projects\AuctionApp\
├── server.js                    ← Main Express server (PORT 3000)
├── .env                         ← Configuration
├── package.json                 ← Dependencies
│
├── db/
│   ├── schema.js                ← MongoDB collections
│   └── database.js              ← DB connection
│
├── services/
│   ├── auctionService.js        ← Room management
│   ├── teamService.js           ← Team management
│   ├── pointsAccumulator.js     ← Scoring engine
│   └── matchSyncService.js      ← Live match sync
│
├── routes/
│   ├── authRoutes.js            ← Authentication
│   ├── auctionRoutes.js         ← Auction endpoints
│   ├── teamRoutes.js            ← Team endpoints
│   └── liveRoutes.js            ← Leaderboard endpoints
│
├── middleware/
│   └── auth.js                  ← JWT authentication
│
└── api/                         ← Flask API (PORT 5000)
    ├── app.py
    └── requirements.txt
```

---

## 🗄️ Database Information

**MongoDB Connection:**
- **URL:** mongodb://localhost:27017
- **Database Name:** ipl-auction
- **Collections:** 7 (users, auctionRooms, teams, playerPool, playerStats, liveMatches, pointsLog)

**Collections Created Automatically:**
- ✅ users - User accounts and authentication
- ✅ auctionRooms - Auction sessions
- ✅ teams - Teams within rooms
- ✅ playerPool - Available players
- ✅ playerStats - Player statistics
- ✅ liveMatches - Live match data
- ✅ pointsLog - Audit trail

---

## 📊 API Endpoints Available

### **Authentication**
```
POST   /auth/register          - Register new user
POST   /auth/login             - Login and get token
POST   /auth/verify            - Verify token
```

### **Auction Rooms**
```
POST   /api/rooms              - Create auction room
GET    /api/rooms              - List all rooms
GET    /api/rooms/:roomId      - Get room details
PUT    /api/rooms/:roomId      - Update room
DELETE /api/rooms/:roomId      - Delete room
POST   /api/rooms/:roomId/join - Join room
POST   /api/rooms/:roomId/leave - Leave room
```

### **Teams**
```
POST   /api/rooms/:roomId/teams                    - Create team
GET    /api/rooms/:roomId/teams                    - List teams
GET    /api/rooms/:roomId/teams/:teamId            - Get team
POST   /api/rooms/:roomId/teams/:teamId/players    - Add player
DELETE /api/rooms/:roomId/teams/:teamId/players/:playerId - Remove player
GET    /api/rooms/:roomId/teams/:teamId/stats      - Get team stats
```

### **Live Features**
```
GET    /api/rooms/:roomId/leaderboard              - Live leaderboard
GET    /api/matches/active                         - Active matches
GET    /api/matches/:matchId/live                  - Match details
POST   /api/matches/:matchId/sync                  - Start match sync
POST   /api/matches/:matchId/stop-sync             - Stop match sync
GET    /api/system/health                          - System status
```

---

## 🔐 Environment Configuration

Your `.env` file is configured:

```env
PORT=3000
MONGO_URL=mongodb://localhost:27017
DB_NAME=ipl-auction
JWT_SECRET=your-super-secret-key-change-in-production
MATCH_SYNC_INTERVAL=60
```

---

## ✅ Verification Checklist

- [x] MongoDB installed and running (Windows Service)
- [x] Node.js dependencies installed (npm install)
- [x] Flask API server running (port 5000)
- [x] Express server running (port 3000)
- [x] Database connection verified
- [x] All API routes responding
- [x] Authentication system ready
- [x] Points calculation engine ready
- [x] Live match sync service ready

---

## 🚨 Troubleshooting

### **MongoDB Connection Error**
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# If not running, start it
Start-Service MongoDB
```

### **Port Already in Use**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### **Flask API Not Responding**
```powershell
# Make sure Python and requirements are installed
cd api
pip install -r requirements.txt
python app.py
```

### **Token Errors**
```
- Token expired: Login again to get a fresh token
- Invalid token: Check token is properly formatted in Authorization header
- Token format: "Bearer YOUR_TOKEN_HERE"
```

---

## 📚 Key Features Now Available

✅ **User Authentication** - Secure JWT-based login  
✅ **Auction Rooms** - Create and manage auction sessions  
✅ **Team Management** - Create teams and draft players  
✅ **Points Calculation** - Automatic scoring based on player performance  
✅ **Live Match Sync** - Polls Cricbuzz API every 60 seconds  
✅ **Leaderboard** - Real-time team rankings  
✅ **Player Stats** - Detailed performance tracking  
✅ **Audit Trail** - All changes logged in database  

---

## 🎯 What's Next?

1. **Test the endpoints** - Use the curl/PowerShell examples above
2. **Create rooms and teams** - Start your first auction
3. **Monitor the leaderboard** - Watch live score updates
4. **Review the logs** - Check console output for details

---

## 📞 Quick Reference

| Need | Command | Port |
|------|---------|------|
| Check MongoDB | `Get-Service MongoDB` | 27017 |
| View Flask API | http://localhost:5000 | 5000 |
| Access Dashboard | http://localhost:3000 | 3000 |
| DB Connection | mongodb://localhost:27017 | 27017 |

---

## 🎉 System Ready!

Your Virtual IPL Auction System is now **fully operational** with:
- ✅ Database connected
- ✅ API servers running
- ✅ All endpoints ready
- ✅ Authentication system active
- ✅ Live sync service configured

**Time to start your first auction! 🏏**

---

**Questions or Issues?** Check the AUCTION_SETUP_GUIDE.md for detailed documentation.
