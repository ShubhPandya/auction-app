/**
 * DB Migration Script
 * Run: node db/migrate.js
 *
 * Applies schema changes and creates all required indexes.
 * Safe to run multiple times — createIndex is idempotent.
 */

'use strict';

require('dotenv').config();
const { connect, getDB, disconnect } = require('./database');

async function migrate() {
  await connect();
  const db = getDB();

  console.log('🔄 Running migrations...');

  // Helper: create index, skip if an equivalent index already exists
  async function ensureIndex(colName, keySpec, options = {}) {
    try {
      await db.collection(colName).createIndex(keySpec, options);
    } catch (err) {
      if (err.code === 85 || err.code === 86) {
        // IndexOptionsConflict or IndexKeySpecsConflict — already exists, skip
      } else {
        throw err;
      }
    }
  }

  // ── auctionRooms indexes ────────────────────────────────────────────────
  // Drop any previous inviteCode indexes before recreating
  for (const name of ['inviteCode_1', 'inviteCode_unique', 'inviteCode_unique_partial']) {
    try { await db.collection('auctionRooms').dropIndex(name); console.log(`  ℹ️  Dropped ${name}`); } catch (_) {}
  }
  // partialFilterExpression allows null/missing inviteCode on existing rooms
  await db.collection('auctionRooms').createIndex(
    { inviteCode: 1 },
    { unique: true, partialFilterExpression: { inviteCode: { $type: 'string' } }, name: 'inviteCode_unique_partial' }
  );
  await ensureIndex('auctionRooms', { createdBy: 1 });
  await ensureIndex('auctionRooms', { status: 1 });
  await ensureIndex('auctionRooms', { participants: 1 });
  console.log('✅ auctionRooms indexes');

  // ── teams indexes ────────────────────────────────────────────────────────
  await ensureIndex('teams', { roomId: 1 });
  await ensureIndex('teams', { owner: 1 });
  await ensureIndex('teams', { 'players.playerId': 1 });
  console.log('✅ teams indexes');

  // ── playerPool indexes ───────────────────────────────────────────────────
  await ensureIndex('playerPool', { playerName: 1 }, { unique: true });
  await ensureIndex('playerPool', { iplTeam: 1 });
  await ensureIndex('playerPool', { role: 1 });
  await ensureIndex('playerPool', { status: 1 });
  await ensureIndex('playerPool', { cricbuzzId: 1 }, { sparse: true });
  console.log('✅ playerPool indexes');

  // ── auctionSession indexes ───────────────────────────────────────────────
  await ensureIndex('auctionSession', { roomId: 1 }, { unique: true });
  await ensureIndex('auctionSession', { state: 1 });
  console.log('✅ auctionSession indexes');

  // ── bids indexes ─────────────────────────────────────────────────────────
  await ensureIndex('bids', { roomId: 1, playerId: 1 });
  await ensureIndex('bids', { sessionId: 1 });
  await ensureIndex('bids', { bidderId: 1 });
  await ensureIndex('bids', { serverTimestamp: -1 });
  console.log('✅ bids indexes');

  // ── liveMatches indexes ──────────────────────────────────────────────────
  // Drop all old liveMatches indexes (excluding _id) before recreating cleanly
  for (const name of ['status_idx', 'cricbuzzMatchId_idx', 'matchNo_idx', 'cricbuzzMatchId_1', 'status_1', 'matchNo_1']) {
    try { await db.collection('liveMatches').dropIndex(name); } catch (_) {}
  }
  await ensureIndex('liveMatches', { cricbuzzMatchId: 1 }, { unique: true });
  await ensureIndex('liveMatches', { status: 1 });
  await ensureIndex('liveMatches', { matchNo: 1 });
  console.log('✅ liveMatches indexes');

  // ── pointsLog indexes ────────────────────────────────────────────────────
  await ensureIndex('pointsLog', { roomId: 1, teamId: 1 });
  await ensureIndex('pointsLog', { matchId: 1 });
  await ensureIndex('pointsLog', { timestamp: -1 });
  console.log('✅ pointsLog indexes');

  // ── users indexes ────────────────────────────────────────────────────────
  await ensureIndex('users', { email: 1 }, { unique: true });
  await ensureIndex('users', { username: 1 }, { unique: true });
  console.log('✅ users indexes');

  console.log('\n✅ Migration complete.');
}

migrate()
  .catch(err => { console.error('❌ Migration failed:', err); process.exit(1); })
  .finally(() => disconnect());
