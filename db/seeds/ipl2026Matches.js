/**
 * IPL 2026 Matches Seed
 * Reads match schedule from api/match_ids.json and upserts into liveMatches collection.
 * Upserts by cricbuzzMatchId — idempotent.
 *
 * NOTE: match_ids.json currently contains IPL2021 data (56 matches).
 * When an IPL2026 key is added to that file, update the SEASON constant below.
 */

'use strict';

const path = require('path');

const SEASON = 'IPL2021'; // Change to 'IPL2026' once that data is available in match_ids.json

/**
 * Seed matches into the liveMatches collection.
 * @param {import('mongodb').Db} db
 */
async function seedMatches(db) {
  const matchIdsPath = path.join(__dirname, '..', '..', 'api', 'match_ids.json');
  let allMatchData;
  try {
    allMatchData = require(matchIdsPath);
  } catch (err) {
    console.error('❌ Could not read api/match_ids.json:', err.message);
    throw err;
  }

  const matches = allMatchData[SEASON];
  if (!matches || !Array.isArray(matches)) {
    throw new Error(`No match data found for season "${SEASON}" in match_ids.json`);
  }

  const collection = db.collection('liveMatches');
  const now = new Date();
  let inserted = 0;
  let updated = 0;

  for (const m of matches) {
    const result = await collection.updateOne(
      { cricbuzzMatchId: String(m.match_id) },
      {
        $set: {
          matchNo: m.match_no,
          matchName: m.match_name,
          matchDate: m.match_date,
          matchTime: m.match_time,
          venue: m.match_venue,
          matchResult: m.match_result !== 'NA' ? m.match_result : null,
          status: m.match_result && m.match_result !== 'NA' ? 'completed' : 'upcoming',
          updatedAt: now,
        },
        $setOnInsert: {
          cricbuzzMatchId: String(m.match_id),
          team1: null,
          team2: null,
          currentInnings: null,
          currentOver: null,
          score: null,
          wickets: null,
          batting: [],
          bowling: [],
          playing11Innings1: [],
          playing11Innings2: [],
          toss: null,
          result: null,
          lastSyncTime: null,
          createdAt: now,
        },
      },
      { upsert: true }
    );
    if (result.upsertedCount > 0) inserted++;
    else updated++;
  }

  console.log(`✅ liveMatches (${SEASON}): ${inserted} inserted, ${updated} updated (${matches.length} total)`);
}

module.exports = { seedMatches };
