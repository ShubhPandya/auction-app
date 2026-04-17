/**
 * Express Server - Virtual IPL Auction System with Live Points Tracking
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const db = require('./db/database');
const { collections } = require('./db/database');
const auth = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const teamRoutes = require('./routes/teamRoutes');
const liveRoutes = require('./routes/liveRoutes');
const socketService = require('./services/socketService');

const app = express();
const PORT = process.env.PORT || 3000;
let httpServer = null;
let io = null;

async function getRoomStateSnapshot(roomId) {
  const roomsCollection = collections.auctionRooms();
  const sessionsCollection = collections.auctionSession();
  const teamsCollection = collections.teams();

  const [room, auctionSession, teams] = await Promise.all([
    roomsCollection.findOne({ _id: roomId }),
    sessionsCollection.findOne({ roomId }),
    teamsCollection.find({ roomId }).project({ _id: 1, teamName: 1, owner: 1, budgetRemaining: 1, totalPoints: 1 }).toArray()
  ]);

  return {
    roomId,
    room: room || null,
    auctionSession: auctionSession || null,
    teams: teams || [],
    timestamp: new Date()
  };
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (no auth required)
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🏏 Virtual IPL Auction System with Live Points Tracking',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        verify: 'POST /auth/verify'
      },
      auction: {
        createRoom: 'POST /api/rooms',
        listRooms: 'GET /api/rooms',
        getRoom: 'GET /api/rooms/:roomId',
        updateRoom: 'PUT /api/rooms/:roomId',
        deleteRoom: 'DELETE /api/rooms/:roomId',
        joinRoom: 'POST /api/rooms/:roomId/join',
        leaveRoom: 'POST /api/rooms/:roomId/leave'
      },
      teams: {
        createTeam: 'POST /api/rooms/:roomId/teams',
        listTeams: 'GET /api/rooms/:roomId/teams',
        getTeam: 'GET /api/rooms/:roomId/teams/:teamId',
        addPlayer: 'POST /api/rooms/:roomId/teams/:teamId/players',
        removePlayer: 'DELETE /api/rooms/:roomId/teams/:teamId/players/:playerId',
        getTeamStats: 'GET /api/rooms/:roomId/teams/:teamId/stats'
      },
      live: {
        leaderboard: 'GET /api/rooms/:roomId/leaderboard',
        activeMatches: 'GET /api/matches/active',
        liveMatch: 'GET /api/matches/:matchId/live',
        syncMatch: 'POST /api/matches/:matchId/sync',
        stopSync: 'POST /api/matches/:matchId/stop-sync',
        activeSyncs: 'GET /api/system/active-syncs',
        playerStats: 'GET /api/players/:playerName/stats'
      }
    }
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/rooms', auctionRoutes);
app.use('/api/rooms/:roomId/teams', teamRoutes);
app.use('/api', liveRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

/**
 * Start server
 */
async function start() {
  try {
    // Connect to MongoDB
    await db.connect();

    httpServer = http.createServer(app);
    io = new Server(httpServer, {
      cors: {
        origin: 'http://localhost:8000',
        methods: ['GET', 'POST']
      }
    });

    socketService.init(io);

    io.on('connection', (socket) => {
      socket.on('join-auction-room', async (payload = {}) => {
        try {
          const { roomId, token } = payload;

          if (!roomId || !token) {
            socket.emit('socket-error', { message: 'roomId and token are required' });
            return;
          }

          const decoded = auth.verifyToken(token);
          if (!decoded?.userId) {
            socket.emit('socket-error', { message: 'Invalid or expired token' });
            return;
          }

          await socketService.joinRoom(socket, roomId);
          socket.data.userId = decoded.userId;
          socket.data.roomId = roomId;

          socket.emit('joined-auction-room', { roomId, socketId: socket.id });

          const snapshot = await getRoomStateSnapshot(roomId);
          socketService.emitToSocket(socket.id, 'room-state', snapshot);
        } catch (error) {
          console.error('Socket join-auction-room error:', error);
          socket.emit('socket-error', { message: 'Failed to join auction room' });
        }
      });

      socket.on('leave-auction-room', async (payload = {}) => {
        try {
          const roomId = payload.roomId || socket.data.roomId;
          if (!roomId) return;

          await socketService.leaveRoom(socket, roomId);
          socket.emit('left-auction-room', { roomId });
          socket.data.roomId = null;
        } catch (error) {
          console.error('Socket leave-auction-room error:', error);
          socket.emit('socket-error', { message: 'Failed to leave auction room' });
        }
      });

      socket.on('disconnect', () => {
        // Reserved for cleanup hooks when live auction state is added.
      });
    });

    // Start Express server
    httpServer.listen(PORT, () => {
      console.log(`\n╔════════════════════════════════════════════════════════════╗`);
      console.log(`║  🏏 IPL AUCTION - LIVE POINTS TRACKING SYSTEM             ║`);
      console.log(`║  ✅ Server running on http://localhost:${PORT}${' '.repeat(17 - String(PORT).length)}║`);
      console.log(`║  📊 Database: Connected                                    ║`);
      console.log(`║                                                            ║`);
      console.log(`║  Quick Start:                                              ║`);
      console.log(`║  1. Register: POST /auth/register                          ║`);
      console.log(`║  2. Login: POST /auth/login                                ║`);
      console.log(`║  3. Create Room: POST /api/rooms                           ║`);
      console.log(`║  4. Create Team: POST /api/rooms/:roomId/teams             ║`);
      console.log(`║  5. Add Player: POST /api/rooms/:roomId/teams/:teamId/... ║`);
      console.log(`║  6. Sync Match: POST /api/matches/:matchId/sync            ║`);
      console.log(`║  7. View Leaderboard: GET /api/rooms/:roomId/leaderboard   ║`);
      console.log(`╚════════════════════════════════════════════════════════════╝\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  if (io) io.close();
  if (httpServer) httpServer.close();
  await db.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down...');
  if (io) io.close();
  if (httpServer) httpServer.close();
  await db.disconnect();
  process.exit(0);
});

// Start the server
start();

module.exports = app;
