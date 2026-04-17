/**
 * Live Routes - Leaderboard, Match Sync, and Real-time Updates
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const matchSyncService = require('../services/matchSyncService');
const teamService = require('../services/teamService');
const pointsAccumulator = require('../services/pointsAccumulator');
const { collections } = require('../db/database');

// Protect routes with auth middleware (optional for public leaderboard)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = auth.verifyToken(token);
    if (decoded) {
      req.userId = decoded.userId;
    }
  }
  next();
};

router.use(optionalAuth);

/**
 * GET /api/rooms/:roomId/leaderboard
 * Get live room leaderboard
 */
router.get('/:roomId/leaderboard', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { sortBy = 'points' } = req.query;

    const teamsCollection = collections.teams();

    let teams = await teamsCollection
      .find({ roomId })
      .toArray();

    // Sort teams
    teams.sort((a, b) => {
      if (sortBy === 'points') {
        return b.totalPoints - a.totalPoints;
      } else if (sortBy === 'rank') {
        return a.rank - b.rank;
      }
      return 0;
    });

    // Add rankings
    teams.forEach((team, index) => {
      team.rank = index + 1;
    });

    res.status(200).json({
      status: 'success',
      data: {
        roomId,
        teams,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get leaderboard'
    });
  }
});

/**
 * GET /api/matches/active
 * Get all active matches
 */
router.get('/matches/active', async (req, res) => {
  try {
    const matchesCollection = collections.liveMatches();

    const matches = await matchesCollection
      .find({ status: { $in: ['live', 'upcoming'] } })
      .toArray();

    res.status(200).json({
      status: 'success',
      data: matches,
      count: matches.length
    });
  } catch (error) {
    console.error('Get active matches error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get active matches'
    });
  }
});

/**
 * GET /api/matches/:matchId/live
 * Get live match data
 */
router.get('/matches/:matchId/live', async (req, res) => {
  try {
    const { matchId } = req.params;

    const result = await matchSyncService.getLiveMatchData(matchId);

    if (!result.success) {
      return res.status(404).json({
        status: 'error',
        message: result.message
      });
    }

    res.status(200).json({
      status: 'success',
      data: result.data
    });
  } catch (error) {
    console.error('Get live match error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get match data'
    });
  }
});

/**
 * POST /api/matches/:matchId/sync
 * Manually trigger match sync
 */
router.post('/matches/:matchId/sync', auth.authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { startContinuousSync = false, syncIntervalSeconds = 60 } = req.body;

    if (startContinuousSync) {
      const result = await matchSyncService.startMatchSync(
        matchId,
        'http://localhost:5000',
        syncIntervalSeconds
      );

      return res.status(200).json({
        status: 'success',
        message: result.message,
        data: result
      });
    }

    // Single sync
    const result = await matchSyncService.performSync(matchId);

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Sync match error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to sync match'
    });
  }
});

/**
 * POST /api/matches/:matchId/stop-sync
 * Stop syncing for a match
 */
router.post('/matches/:matchId/stop-sync', auth.authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;

    const result = matchSyncService.stopMatchSync(matchId);

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    console.error('Stop sync error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to stop sync'
    });
  }
});

/**
 * GET /api/system/active-syncs
 * Get all active syncs
 */
router.get('/system/active-syncs', auth.authMiddleware, async (req, res) => {
  try {
    const result = matchSyncService.getActiveSyncs();

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Get syncs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get syncs'
    });
  }
});

/**
 * POST /api/system/stop-all-syncs
 * Stop all syncs
 */
router.post('/system/stop-all-syncs', auth.authMiddleware, async (req, res) => {
  try {
    const result = matchSyncService.stopAllSyncs();

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    console.error('Stop all syncs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to stop syncs'
    });
  }
});

/**
 * GET /api/players/:playerName/stats
 * Get player stats
 */
router.get('/players/:playerName/stats', async (req, res) => {
  try {
    const { playerName } = req.params;

    const result = await pointsAccumulator.getPlayerPointsBreakdown(playerName);

    if (!result.success) {
      return res.status(404).json({
        status: 'error',
        message: result.message
      });
    }

    res.status(200).json({
      status: 'success',
      data: result.data
    });
  } catch (error) {
    console.error('Get player stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get player stats'
    });
  }
});

/**
 * GET /api/system/health
 * Health check
 */
router.get('/system/health', async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'System is healthy',
      timestamp: new Date(),
      syncs: matchSyncService.getActiveSyncs()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'System health check failed'
    });
  }
});

module.exports = router;
