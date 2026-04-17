/**
 * DB Seed Entry Point
 * Run: node db/seed.js
 *
 * Seeds both IPL 2026 player pool and match schedule.
 * Idempotent — safe to run multiple times (uses upserts).
 */

'use strict';

require('dotenv').config();
const { connect, getDB, disconnect } = require('./database');
const { seedPlayers } = require('./seeds/ipl2026Players');
const { seedMatches } = require('./seeds/ipl2026Matches');

async function seed() {
  await connect();
  const db = getDB();

  console.log('🌱 Seeding database (clean rebuild)...\n');

  await seedPlayers(db);
  await seedMatches(db);

  console.log('\n✅ Seed complete.');
}

seed()
  .catch(err => { console.error('❌ Seed failed:', err); process.exit(1); })
  .finally(() => disconnect());
