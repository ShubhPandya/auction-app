/**
 * Match Sync Service - Fetch live data from Cricbuzz API and sync to database
 */

const { collections, generateId } = require('../db/database');
const pointsAccumulator = require('./pointsAccumulator');
const pointsCalculator = require('./pointsCalculator');

let syncIntervals = {}; // Track active sync intervals

/**
 * Start syncing live match data
 */
async function startMatchSync(matchId, apiBaseUrl = 'http://localhost:5000', intervalSeconds = 60) {
  try {
    // Check if already syncing
    if (syncIntervals[matchId]) {
      console.log(`⚠️  Match ${matchId} already being synced`);
      return {
        success: false,
        message: 'Match already being synced'
      };
    }

    console.log(`🚀 Starting live sync for match ${matchId} (every ${intervalSeconds}s)`);

    // Do first sync immediately
    await performSync(matchId, apiBaseUrl);

    // Set up interval for subsequent syncs
    const intervalId = setInterval(async () => {
      try {
        await performSync(matchId, apiBaseUrl);
      } catch (error) {
        console.error(`❌ Sync error for match ${matchId}:`, error.message);
      }
    }, intervalSeconds * 1000);

    syncIntervals[matchId] = intervalId;

    return {
      success: true,
      message: `Syncing match ${matchId}`,
      intervalId
    };
  } catch (error) {
    console.error('Start sync error:', error);
    return {
      success: false,
      message: 'Failed to start sync: ' + error.message
    };
  }
}

/**
 * Stop syncing for a match
 */
function stopMatchSync(matchId) {
  try {
    if (syncIntervals[matchId]) {
      clearInterval(syncIntervals[matchId]);
      delete syncIntervals[matchId];

      console.log(`⏹️  Stopped syncing for match ${matchId}`);

      return {
        success: true,
        message: 'Sync stopped'
      };
    }

    return {
      success: false,
      message: 'No active sync for this match'
    };
  } catch (error) {
    console.error('Stop sync error:', error);
    return {
      success: false,
      message: 'Failed to stop sync: ' + error.message
    };
  }
}

/**
 * Perform a single sync operation
 */
async function performSync(matchId, apiBaseUrl = 'http://localhost:5000') {
  try {
    // Fetch live data from Flask API
    const response = await fetch(`${apiBaseUrl}/scorecard/${matchId}`);
    
    if (!response.ok) {
      console.warn(`⚠️  API returned status ${response.status} for match ${matchId}`);
      return {
        success: false,
        message: 'API error'
      };
    }

    const scorecard = await response.json();

    if (!scorecard) {
      console.warn(`⚠️  No data for match ${matchId}`);
      return {
        success: false,
        message: 'No scorecard data'
      };
    }

    // Extract data from API response
    const batting = scorecard.Innings2?.[0]?.Batsman || [];
    const bowling = scorecard.Innings2?.[1]?.Bowlers || [];
    const match2Score = scorecard.Innings2?.[2] || {};

    const infoData = {
      matchId,
      team1: scorecard.Innings1?.[2]?.team || 'Team 1',
      team2: match2Score.team || 'Team 2',
      status: scorecard.result ? 'completed' : 'live',
      venue: scorecard.venue || 'Unknown',
      currentInnings: 2,
      currentOver: match2Score.overs || '0.0',
      score: match2Score.runs || 0,
      wickets: match2Score.wickets || 0,
      toss: scorecard.toss_result || {},
      result: scorecard.result
    };

    // Get existing match data
    const matchesCollection = collections.liveMatches();
    let existingMatch = await matchesCollection.findOne({ matchId });

    if (!existingMatch) {
      // Create new match document
      const now = new Date();
      existingMatch = {
        _id: generateId(),
        matchId,
        ...infoData,
        batting: [],
        bowling: [],
        lastSyncTime: now,
        createdAt: now,
        updatedAt: now
      };

      await matchesCollection.insertOne(existingMatch);
      console.log(`✅ New match ${matchId} created`);
    } else {
      // Update existing match
      await matchesCollection.updateOne(
        { matchId },
        {
          $set: {
            ...infoData,
            lastSyncTime: new Date(),
            updatedAt: new Date()
          }
        }
      );
    }

    // Process and accumulate points
    const pointsUpdate = await pointsAccumulator.processMatchData(
      matchId,
      batting,
      bowling,
      []
    );

    // Calculate points from Flask API if cricbuzzMatchId available
    if (existingMatch.cricbuzzMatchId) {
      await pointsCalculator.calculateMatchPoints(matchId, existingMatch.cricbuzzMatchId);
    }

    // Update team points if this room is tracking this match
    const roomsCollection = collections.auctionRooms();
    const rooms = await roomsCollection.find({ activeMatches: matchId }).toArray();

    for (const room of rooms) {
      await updateRoomTeamPoints(room._id, matchId);
    }

    console.log(`📊 Match ${matchId} synced at ${new Date().toLocaleTimeString()}`);

    return {
      success: true,
      message: 'Sync completed',
      playersUpdated: pointsUpdate.updates?.length || 0,
      timestamp: new Date()
    };
  } catch (error) {
    console.error(`❌ Perform sync error for ${matchId}:`, error);
    return {
      success: false,
      message: 'Sync failed: ' + error.message
    };
  }
}

/**
 * Update team points based on their players' stats
 */
async function updateRoomTeamPoints(roomId, matchId) {
  try {
    const teamsCollection = collections.teams();
    const playerStatsCollection = collections.playerStats();
    const pointsLogCollection = collections.pointsLog();

    // Get all teams in room
    const teams = await teamsCollection.find({ roomId }).toArray();

    for (const team of teams) {
      let totalPointsIncrease = 0;
      const logEntries = [];

      // Calculate points for each player in team
      for (const teamPlayer of team.players) {
        const playerStats = await playerStatsCollection.findOne({
          playerName: teamPlayer.playerName
        });

        if (playerStats) {
          // Check if this is new data from this match
          const lastMatchEntry = playerStats.matchStats?.[playerStats.matchStats.length - 1];
          
          if (lastMatchEntry?.matchId === matchId) {
            const pointsEarned = lastMatchEntry.pointsEarned || 0;
            totalPointsIncrease += pointsEarned;

            logEntries.push({
              playerName: teamPlayer.playerName,
              pointsEarned,
              action: 'match_update'
            });
          }
        }
      }

      // Update team total points
      if (totalPointsIncrease > 0) {
        await teamsCollection.updateOne(
          { _id: team._id },
          {
            $inc: { totalPoints: totalPointsIncrease },
            $set: { lastUpdated: new Date() }
          }
        );

        // Log points changes
        for (const entry of logEntries) {
          await pointsAccumulator.logPointsChange(
            roomId,
            team._id,
            null,
            entry.playerName,
            matchId,
            entry.action,
            entry.pointsEarned
          );
        }

        console.log(`📈 Team ${team.teamName}: +${totalPointsIncrease} points from match ${matchId}`);
      }
    }
  } catch (error) {
    console.error('Update room team points error:', error);
  }
}

/**
 * Get live match data
 */
async function getLiveMatchData(matchId) {
  try {
    const matchesCollection = collections.liveMatches();
    const match = await matchesCollection.findOne({ matchId });

    if (!match) {
      return {
        success: false,
        message: 'Match not found'
      };
    }

    return {
      success: true,
      data: match
    };
  } catch (error) {
    console.error('Get live match error:', error);
    return {
      success: false,
      message: 'Failed to get match data: ' + error.message
    };
  }
}

/**
 * Get all active matches being synced
 */
function getActiveSyncs() {
  const matches = Object.keys(syncIntervals);
  return {
    success: true,
    activeSyncs: matches,
    count: matches.length
  };
}

/**
 * Stop all syncs
 */
function stopAllSyncs() {
  for (const matchId in syncIntervals) {
    clearInterval(syncIntervals[matchId]);
  }
  syncIntervals = {};

  console.log('✅ All syncs stopped');

  return {
    success: true,
    message: 'All syncs stopped'
  };
}

module.exports = {
  startMatchSync,
  stopMatchSync,
  performSync,
  updateRoomTeamPoints,
  getLiveMatchData,
  getActiveSyncs,
  stopAllSyncs
};
