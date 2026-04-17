/**
 * MongoDB Database Connection and Initialization
 */

const { MongoClient, ObjectId } = require('mongodb');

let db = null;
let client = null;

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'ipl-auction';

/**
 * Connect to MongoDB
 */
async function connect() {
  try {
    if (client && client.topology && client.topology.isConnected()) {
      console.log('✅ Already connected to MongoDB');
      return db;
    }

    client = new MongoClient(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10
    });

    await client.connect();
    db = client.db(DB_NAME);
    
    console.log(`✅ Connected to MongoDB - Database: ${DB_NAME}`);
    
    // Create indexes for better performance
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    throw error;
  }
}

/**
 * Create indexes for performance optimization.
 * Each index is wrapped individually so one conflict does not abort the rest.
 * Authoritative index management is in db/migrate.js — this is best-effort.
 */
async function createIndexes() {
  async function tryIndex(col, key, opts = {}) {
    try {
      await db.collection(col).createIndex(key, opts);
    } catch (err) {
      if (err.code === 85 || err.code === 86 || err.code === 68) return; // already exists
      // Non-critical — log but don't crash the server
      console.warn(`⚠️  Index warning [${col}]:`, err.message);
    }
  }

  await tryIndex('users', { email: 1 }, { unique: true });
  await tryIndex('users', { username: 1 }, { unique: true });

  await tryIndex('auctionRooms', { createdBy: 1 });
  await tryIndex('auctionRooms', { status: 1 });
  await tryIndex('auctionRooms', { participants: 1 });

  await tryIndex('teams', { roomId: 1 });
  await tryIndex('teams', { owner: 1 });
  await tryIndex('teams', { 'players.playerId': 1 });

  await tryIndex('playerStats', { playerName: 1 });
  await tryIndex('playerStats', { iplTeam: 1 });

  await tryIndex('pointsLog', { roomId: 1, teamId: 1 });
  await tryIndex('pointsLog', { matchId: 1 });
  await tryIndex('pointsLog', { timestamp: -1 });

  await tryIndex('playerPool', { playerName: 1 }, { unique: true });
  await tryIndex('playerPool', { status: 1 });
  await tryIndex('playerPool', { draftedBy: 1 });

  await tryIndex('liveMatches', { cricbuzzMatchId: 1 }, { unique: true });
  await tryIndex('liveMatches', { status: 1 });

  await tryIndex('auctionSession', { roomId: 1 }, { unique: true });
  await tryIndex('auctionSession', { state: 1 });

  await tryIndex('bids', { roomId: 1, sessionId: 1, playerId: 1, serverTimestamp: -1 });
  await tryIndex('bids', { bidderId: 1, serverTimestamp: -1 });
}

/**
 * Disconnect from MongoDB
 */
async function disconnect() {
  try {
    if (client) {
      await client.close();
      db = null;
      client = null;
      console.log('✅ Disconnected from MongoDB');
    }
  } catch (error) {
    console.error('❌ Disconnect Error:', error);
  }
}

/**
 * Get database instance
 */
function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return db;
}

/**
 * Generate MongoDB ObjectId
 */
function generateId() {
  return new ObjectId().toString();
}

/**
 * Collection helpers
 */
const collections = {
  users: () => getDB().collection('users'),
  auctionRooms: () => getDB().collection('auctionRooms'),
  teams: () => getDB().collection('teams'),
  liveMatches: () => getDB().collection('liveMatches'),
  auctionSession: () => getDB().collection('auctionSession'),
  bids: () => getDB().collection('bids'),
  playerStats: () => getDB().collection('playerStats'),
  pointsLog: () => getDB().collection('pointsLog'),
  playerPool: () => getDB().collection('playerPool')
};

module.exports = {
  connect,
  disconnect,
  getDB,
  generateId,
  collections,
  ObjectId
};
