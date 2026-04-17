/**
 * Points Accumulator - Calculate and track points based on player performance
 * Uses the points_system.md scoring rules
 */

const { collections, generateId } = require('../db/database');

// Points scoring system from points_system.md
const POINTS_SYSTEM = {
  BATTING: {
    RUN: 1,
    FOUR: 2,
    SIX: 4,
    FIFTY_BONUS: 5,
    HUNDRED_BONUS: 12
  },
  BOWLING: {
    WICKET: 25,
    WICKET_3_BONUS: 8,
    WICKET_5_BONUS: 15,
    DOT_BALL: 1,
    MAIDEN: 5,
    MAIDEN_WICKET: 8
  },
  FIELDING: {
    CATCH: 8,
    RUN_OUT_DIRECT: 10,
    RUN_OUT_ASSIST: 5,
    STUMPING: 8
  }
};

/**
 * Calculate batting points for a player
 */
function calculateBattingPoints(stats) {
  let points = 0;

  // Base points for runs
  if (stats.runs) {
    points += stats.runs * POINTS_SYSTEM.BATTING.RUN;
  }

  // Fours
  if (stats.fours) {
    points += stats.fours * POINTS_SYSTEM.BATTING.FOUR;
  }

  // Sixes
  if (stats.sixes) {
    points += stats.sixes * POINTS_SYSTEM.BATTING.SIX;
  }

  // 50 runs bonus
  if (stats.runs >= 50 && stats.runs < 100) {
    points += POINTS_SYSTEM.BATTING.FIFTY_BONUS;
  }

  // 100 runs bonus
  if (stats.runs >= 100) {
    points += POINTS_SYSTEM.BATTING.HUNDRED_BONUS;
  }

  return points;
}

/**
 * Calculate bowling points for a player
 */
function calculateBowlingPoints(stats) {
  let points = 0;

  // Base points for wickets
  if (stats.wickets) {
    points += stats.wickets * POINTS_SYSTEM.BOWLING.WICKET;
  }

  // 3 wickets bonus
  if (stats.wickets >= 3 && stats.wickets < 5) {
    points += POINTS_SYSTEM.BOWLING.WICKET_3_BONUS;
  }

  // 5 wickets bonus
  if (stats.wickets >= 5) {
    points += POINTS_SYSTEM.BOWLING.WICKET_5_BONUS;
  }

  // Dot balls
  if (stats.dotBalls) {
    points += stats.dotBalls * POINTS_SYSTEM.BOWLING.DOT_BALL;
  }

  // Maiden overs
  if (stats.maidens) {
    points += stats.maidens * POINTS_SYSTEM.BOWLING.MAIDEN;
  }

  // Maiden with wicket bonus
  if (stats.maidenWickets) {
    points += stats.maidenWickets * POINTS_SYSTEM.BOWLING.MAIDEN_WICKET;
  }

  return points;
}

/**
 * Calculate fielding points for a player
 */
function calculateFieldingPoints(stats) {
  let points = 0;

  // Catches
  if (stats.catches) {
    points += stats.catches * POINTS_SYSTEM.FIELDING.CATCH;
  }

  // Direct run outs
  if (stats.runOutDirect) {
    points += stats.runOutDirect * POINTS_SYSTEM.FIELDING.RUN_OUT_DIRECT;
  }

  // Run out assists
  if (stats.runOutAssist) {
    points += stats.runOutAssist * POINTS_SYSTEM.FIELDING.RUN_OUT_ASSIST;
  }

  // Stumpings
  if (stats.stumpings) {
    points += stats.stumpings * POINTS_SYSTEM.FIELDING.STUMPING;
  }

  return points;
}

/**
 * Calculate total points for a player
 */
function calculateTotalPoints(playerStats) {
  const batting = calculateBattingPoints(playerStats.batting || {});
  const bowling = calculateBowlingPoints(playerStats.bowling || {});
  const fielding = calculateFieldingPoints(playerStats.fielding || {});

  return {
    battingPoints: batting,
    bowlingPoints: bowling,
    fieldingPoints: fielding,
    totalPoints: batting + bowling + fielding
  };
}

/**
 * Process live match data and update player stats
 */
async function processMatchData(matchId, battingData, bowlingData, fieldingData) {
  try {
    const playerStatsCollection = collections.playerStats();
    const updates = [];

    // Process batting data
    if (battingData && Array.isArray(battingData)) {
      for (const batsman of battingData) {
        const playerName = batsman.name || batsman.playerName;
        if (!playerName) continue;

        const stats = {
          runs: parseInt(batsman.runs) || 0,
          balls: parseInt(batsman.balls) || 0,
          fours: parseInt(batsman.fours) || 0,
          sixes: parseInt(batsman.sixes) || 0
        };

        const update = await updatePlayerStats(playerName, 'batsman', { batting: stats }, matchId);
        if (update.success) {
          updates.push({
            playerName,
            role: 'batsman',
            pointsEarned: update.pointsEarned,
            action: 'batting_update'
          });
        }
      }
    }

    // Process bowling data
    if (bowlingData && Array.isArray(bowlingData)) {
      for (const bowler of bowlingData) {
        const playerName = bowler.name || bowler.playerName;
        if (!playerName) continue;

        const stats = {
          wickets: parseInt(bowler.wickets) || 0,
          runs: parseInt(bowler.runs) || 0,
          overs: bowler.overs || '0.0',
          maidens: parseInt(bowler.maidens) || 0,
          dotBalls: parseInt(bowler.dotBalls) || 0
        };

        const update = await updatePlayerStats(playerName, 'bowler', { bowling: stats }, matchId);
        if (update.success) {
          updates.push({
            playerName,
            role: 'bowler',
            pointsEarned: update.pointsEarned,
            action: 'bowling_update'
          });
        }
      }
    }

    console.log(`✅ Processed match ${matchId}: ${updates.length} players updated`);

    return {
      success: true,
      message: `Updated ${updates.length} players`,
      updates
    };
  } catch (error) {
    console.error('Process match data error:', error);
    return {
      success: false,
      message: 'Failed to process match data: ' + error.message
    };
  }
}

/**
 * Update player stats and calculate points
 */
async function updatePlayerStats(playerName, role, newStats, matchId = null) {
  try {
    const playerStatsCollection = collections.playerStats();

    // Get existing player stats
    let player = await playerStatsCollection.findOne({ playerName });

    if (!player) {
      // Create new player stats entry
      const playerId = generateId();
      const now = new Date();

      player = {
        _id: playerId,
        playerName,
        role,
        totalRuns: 0,
        totalFours: 0,
        totalSixes: 0,
        totalWickets: 0,
        totalCatches: 0,
        totalRunOuts: 0,
        totalStumpings: 0,
        battingPoints: 0,
        bowlingPoints: 0,
        fieldingPoints: 0,
        totalPoints: 0,
        matchStats: [],
        lastUpdated: now,
        createdAt: now,
        updatedAt: now
      };
    }

    // Calculate points before and after
    const previousPoints = player.totalPoints;

    // Update stats
    if (newStats.batting) {
      const batting = newStats.batting;
      player.totalRuns = (player.totalRuns || 0) + (batting.runs || 0);
      player.totalFours = (player.totalFours || 0) + (batting.fours || 0);
      player.totalSixes = (player.totalSixes || 0) + (batting.sixes || 0);
    }

    if (newStats.bowling) {
      const bowling = newStats.bowling;
      player.totalWickets = (player.totalWickets || 0) + (bowling.wickets || 0);
    }

    if (newStats.fielding) {
      const fielding = newStats.fielding;
      player.totalCatches = (player.totalCatches || 0) + (fielding.catches || 0);
      player.totalRunOuts = (player.totalRunOuts || 0) + (fielding.runOutDirect || 0);
      player.totalStumpings = (player.totalStumpings || 0) + (fielding.stumpings || 0);
    }

    // Recalculate all points
    const pointBreakdown = calculateTotalPoints({
      batting: {
        runs: player.totalRuns,
        fours: player.totalFours,
        sixes: player.totalSixes
      },
      bowling: {
        wickets: player.totalWickets,
        dotBalls: player.dotBalls || 0
      },
      fielding: {
        catches: player.totalCatches
      }
    });

    player.battingPoints = pointBreakdown.battingPoints;
    player.bowlingPoints = pointBreakdown.bowlingPoints;
    player.fieldingPoints = pointBreakdown.fieldingPoints;
    player.totalPoints = pointBreakdown.totalPoints;
    player.lastUpdated = new Date();
    player.updatedAt = new Date();

    // Add to match stats
    if (matchId) {
      const pointsEarned = player.totalPoints - previousPoints;
      player.matchStats = player.matchStats || [];
      player.matchStats.push({
        matchId,
        date: new Date(),
        pointsEarned,
        ...newStats
      });
    }

    // Save to database
    if (player._id) {
      // Update existing
      await playerStatsCollection.updateOne(
        { playerName },
        { $set: player }
      );
    } else {
      // Insert new
      await playerStatsCollection.insertOne(player);
    }

    const pointsEarned = player.totalPoints - previousPoints;

    console.log(`✅ Player ${playerName}: +${pointsEarned} points (Total: ${player.totalPoints})`);

    return {
      success: true,
      playerName,
      previousPoints,
      newPoints: player.totalPoints,
      pointsEarned,
      breakdown: pointBreakdown
    };
  } catch (error) {
    console.error('Update player stats error:', error);
    return {
      success: false,
      message: 'Failed to update player stats: ' + error.message
    };
  }
}

/**
 * Log points change for audit trail
 */
async function logPointsChange(roomId, teamId, playerId, playerName, matchId, action, pointsEarned) {
  try {
    const pointsLogCollection = collections.pointsLog();

    const logEntry = {
      _id: generateId(),
      roomId,
      teamId,
      playerId,
      playerName,
      matchId,
      action,
      pointsEarned,
      timestamp: new Date(),
      createdAt: new Date()
    };

    await pointsLogCollection.insertOne(logEntry);

    return { success: true };
  } catch (error) {
    console.error('Log points error:', error);
    return { success: false };
  }
}

/**
 * Get points breakdown for a player
 */
async function getPlayerPointsBreakdown(playerName) {
  try {
    const playerStatsCollection = collections.playerStats();

    const player = await playerStatsCollection.findOne({ playerName });

    if (!player) {
      return {
        success: false,
        message: 'Player not found'
      };
    }

    return {
      success: true,
      data: {
        playerName: player.playerName,
        role: player.role,
        batting: {
          runs: player.totalRuns,
          fours: player.totalFours,
          sixes: player.totalSixes,
          points: player.battingPoints
        },
        bowling: {
          wickets: player.totalWickets,
          points: player.bowlingPoints
        },
        fielding: {
          catches: player.totalCatches,
          points: player.fieldingPoints
        },
        totalPoints: player.totalPoints,
        lastUpdated: player.lastUpdated
      }
    };
  } catch (error) {
    console.error('Get breakdown error:', error);
    return {
      success: false,
      message: 'Failed to get breakdown: ' + error.message
    };
  }
}

module.exports = {
  POINTS_SYSTEM,
  calculateBattingPoints,
  calculateBowlingPoints,
  calculateFieldingPoints,
  calculateTotalPoints,
  processMatchData,
  updatePlayerStats,
  logPointsChange,
  getPlayerPointsBreakdown
};
