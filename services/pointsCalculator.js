/**
 * Points Calculator - Calculate points using Flask scorecard API
 * Implements T20 fantasy points scoring from live match data
 */

const axios = require('axios');
const { collections } = require('../db/database');

const FLASK_API = process.env.FLASK_API_URL || 'http://localhost:5000';

// T20 Fantasy Points Scoring Rules
const POINTS = {
  BATTING: {
    RUN: 1,
    FOUR_BONUS: 1,
    SIX_BONUS: 2,
    FIFTY: 8,
    HUNDRED: 16,
    DUCK: -2,
    SR_BONUS: { // Strike Rate bonuses (minimum 10 balls faced)
      EXCELLENT: { min: 170, points: 6 },    // >170
      GOOD: { min: 140, max: 170, points: 4 }, // 140-170
      POOR: { max: 70, points: -6 }            // <70
    }
  },
  BOWLING: {
    WICKET: 25,
    THREE_WICKETS: 4,
    FOUR_WICKETS: 8,
    FIVE_WICKETS: 16,
    MAIDEN: 8,
    ECONOMY: { // Economy rate bonuses
      EXCELLENT: { max: 5, points: 6 },     // <5
      GOOD: { min: 5, max: 6, points: 4 },  // 5-6
      AVERAGE: { min: 6, max: 8, points: 0 }, // 6-8
      POOR: { min: 8, max: 9, points: -2 }, // 8-9
      VERY_POOR: { min: 9, points: -4 }     // >10
    }
  },
  FIELDING: {
    CATCH: 8,
    STUMPING: 12,
    RUNOUT: 6
  }
};

/**
 * Fetch scorecard data from Flask API
 */
async function fetchScorecard(matchId) {
  try {
    const response = await axios.get(`${FLASK_API}/v2/scorecard/${matchId}`, {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch scorecard for match ${matchId}:`, error.message);
    return null;
  }
}

/**
 * Fetch highlights (key events) from Flask API
 */
async function fetchHighlights(matchId, inningsId) {
  try {
    const response = await axios.get(`${FLASK_API}/v2/highlights/${matchId}/${inningsId}`, {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch highlights:`, error.message);
    return null;
  }
}

/**
 * Calculate batting points for a player
 */
function calculateBattingPoints(battingStats, highlights) {
  let points = 0;

  // Runs
  points += (battingStats.runs || 0) * POINTS.BATTING.RUN;

  // Fours and Sixes bonuses
  points += (battingStats.fours || 0) * POINTS.BATTING.FOUR_BONUS;
  points += (battingStats.sixes || 0) * POINTS.BATTING.SIX_BONUS;

  // 50 and 100 bonuses
  if (battingStats.runs >= 100) {
    points += POINTS.BATTING.HUNDRED;
  } else if (battingStats.runs >= 50) {
    points += POINTS.BATTING.FIFTY;
  }

  // Duck penalty
  if (battingStats.runs === 0 && battingStats.dismissal && battingStats.dismissal !== 'not out') {
    points += POINTS.BATTING.DUCK;
  }

  // Strike rate bonus (minimum 10 balls)
  if (battingStats.balls && battingStats.balls >= 10 && battingStats.runs) {
    const sr = (battingStats.runs / battingStats.balls) * 100;
    if (sr > POINTS.BATTING.SR_BONUS.EXCELLENT.min) {
      points += POINTS.BATTING.SR_BONUS.EXCELLENT.points;
    } else if (sr >= POINTS.BATTING.SR_BONUS.GOOD.min && sr <= POINTS.BATTING.SR_BONUS.GOOD.max) {
      points += POINTS.BATTING.SR_BONUS.GOOD.points;
    } else if (sr < POINTS.BATTING.SR_BONUS.POOR.max) {
      points += POINTS.BATTING.SR_BONUS.POOR.points;
    }
  }

  return points;
}

/**
 * Calculate bowling points for a player
 */
function calculateBowlingPoints(bowlingStats) {
  let points = 0;

  // Wickets
  const wickets = bowlingStats.wickets || 0;
  points += wickets * POINTS.BOWLING.WICKET;

  // Bonus wickets
  if (wickets >= 5) {
    points += POINTS.BOWLING.FIVE_WICKETS;
  } else if (wickets === 4) {
    points += POINTS.BOWLING.FOUR_WICKETS;
  } else if (wickets === 3) {
    points += POINTS.BOWLING.THREE_WICKETS;
  }

  // Maidens
  points += (bowlingStats.maidens || 0) * POINTS.BOWLING.MAIDEN;

  // Economy rate bonus (need overs and runs)
  if (bowlingStats.overs && bowlingStats.runs !== undefined) {
    const economy = bowlingStats.runs / bowlingStats.overs;
    if (economy < POINTS.BOWLING.ECONOMY.EXCELLENT.max) {
      points += POINTS.BOWLING.ECONOMY.EXCELLENT.points;
    } else if (economy >= POINTS.BOWLING.ECONOMY.GOOD.min && economy <= POINTS.BOWLING.ECONOMY.GOOD.max) {
      points += POINTS.BOWLING.ECONOMY.GOOD.points;
    } else if (economy >= POINTS.BOWLING.ECONOMY.AVERAGE.min && economy <= POINTS.BOWLING.ECONOMY.AVERAGE.max) {
      points += POINTS.BOWLING.ECONOMY.AVERAGE.points;
    } else if (economy >= POINTS.BOWLING.ECONOMY.POOR.min && economy <= POINTS.BOWLING.ECONOMY.POOR.max) {
      points += POINTS.BOWLING.ECONOMY.POOR.points;
    } else if (economy > POINTS.BOWLING.ECONOMY.VERY_POOR.min) {
      points += POINTS.BOWLING.ECONOMY.VERY_POOR.points;
    }
  }

  return points;
}

/**
 * Calculate fielding points from highlights
 */
function calculateFieldingPoints(playerHighlights) {
  let points = 0;

  if (!playerHighlights) return 0;

  points += (playerHighlights.catches || 0) * POINTS.FIELDING.CATCH;
  points += (playerHighlights.stumpings || 0) * POINTS.FIELDING.STUMPING;
  points += (playerHighlights.runouts || 0) * POINTS.FIELDING.RUNOUT;

  return points;
}

/**
 * Calculate total points for a player in a match
 */
async function calculatePlayerPoints(playerName, matchId, inningsData, highlights) {
  let totalPoints = 0;
  let breakdown = {
    batting: 0,
    bowling: 0,
    fielding: 0
  };

  // Batting points
  if (inningsData.batting && inningsData.batting[playerName]) {
    breakdown.batting = calculateBattingPoints(inningsData.batting[playerName], highlights);
    totalPoints += breakdown.batting;
  }

  // Bowling points
  if (inningsData.bowling && inningsData.bowling[playerName]) {
    breakdown.bowling = calculateBowlingPoints(inningsData.bowling[playerName]);
    totalPoints += breakdown.bowling;
  }

  // Fielding points
  if (highlights && highlights[playerName]) {
    breakdown.fielding = calculateFieldingPoints(highlights[playerName]);
    totalPoints += breakdown.fielding;
  }

  return {
    total: totalPoints,
    breakdown
  };
}

/**
 * Calculate and store points for all players in a match
 */
async function calculateMatchPoints(matchId, cricbuzzMatchId) {
  try {
    console.log(`📊 Calculating points for match ${matchId}...`);

    // Fetch scorecard from Flask API
    const scorecard = await fetchScorecard(cricbuzzMatchId);
    if (!scorecard) {
      console.error(`❌ Could not fetch scorecard for match ${matchId}`);
      return [];
    }

    const pointsLog = [];
    
    // Process each innings
    for (const inningsId in scorecard.innings || {}) {
      const inningsData = scorecard.innings[inningsId];
      const highlights = await fetchHighlights(cricbuzzMatchId, inningsId);

      // Calculate points for each player
      const allPlayers = new Set([
        ...(Object.keys(inningsData.batting || {})),
        ...(Object.keys(inningsData.bowling || {}))
      ]);

      for (const playerName of allPlayers) {
        const pointsResult = await calculatePlayerPoints(
          playerName,
          matchId,
          inningsData,
          highlights
        );

        pointsLog.push({
          matchId,
          playerName,
          inningsId: parseInt(inningsId),
          ...pointsResult.breakdown,
          totalPoints: pointsResult.total,
          timestamp: new Date()
        });
      }
    }

    // Store in pointsLog collection
    if (pointsLog.length > 0) {
      const db = collections.pointsLog();
      // Clear old entries for this match
      await db.deleteMany({ matchId });
      // Insert new entries
      await db.insertMany(pointsLog);
      console.log(`✅ Stored ${pointsLog.length} player points for match ${matchId}`);
    }

    return pointsLog;
  } catch (error) {
    console.error('Points calculation error:', error);
    return [];
  }
}

module.exports = {
  fetchScorecard,
  fetchHighlights,
  calculatePlayerPoints,
  calculateMatchPoints,
  calculateBattingPoints,
  calculateBowlingPoints,
  calculateFieldingPoints
};
