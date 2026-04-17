/**
 * Team Routes - Team and Player Management
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const teamService = require('../services/teamService');

// Protect all routes with auth middleware
router.use(auth.authMiddleware);

/**
 * POST /api/rooms/:roomId/teams
 * Create new team in room
 */
router.post('/', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { teamName, budgetAllocated } = req.body;

    if (!teamName) {
      return res.status(400).json({
        status: 'error',
        message: 'Team name is required'
      });
    }

    const result = await teamService.createTeam(
      roomId,
      { teamName, budgetAllocated },
      req.userId
    );

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.message
      });
    }

    res.status(201).json({
      status: 'success',
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create team'
    });
  }
});

/**
 * GET /api/rooms/:roomId/teams
 * List teams in room
 */
router.get('/', async (req, res) => {
  try {
    const { roomId } = req.params;

    const result = await teamService.listTeams(roomId);

    res.status(200).json({
      status: 'success',
      data: result.data,
      count: result.count
    });
  } catch (error) {
    console.error('List teams error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to list teams'
    });
  }
});

/**
 * GET /api/rooms/:roomId/teams/:teamId
 * Get team details
 */
router.get('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

    const result = await teamService.getTeam(teamId);

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
    console.error('Get team error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get team'
    });
  }
});

/**
 * POST /api/rooms/:roomId/teams/:teamId/players
 * Add player to team
 */
router.post('/:teamId/players', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { playerId, playerName, iplTeam, role } = req.body;

    if (!playerName) {
      return res.status(400).json({
        status: 'error',
        message: 'Player name is required'
      });
    }

    const result = await teamService.addPlayerToTeam(
      teamId,
      { playerId, playerName, iplTeam, role },
      req.userId
    );

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.message
      });
    }

    res.status(201).json({
      status: 'success',
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Add player error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add player'
    });
  }
});

/**
 * DELETE /api/rooms/:roomId/teams/:teamId/players/:playerId
 * Remove player from team
 */
router.delete('/:teamId/players/:playerId', async (req, res) => {
  try {
    const { teamId, playerId } = req.params;

    const result = await teamService.removePlayerFromTeam(teamId, playerId, req.userId);

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.message
      });
    }

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    console.error('Remove player error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove player'
    });
  }
});

/**
 * GET /api/rooms/:roomId/teams/:teamId/stats
 * Get team stats
 */
router.get('/:teamId/stats', async (req, res) => {
  try {
    const { teamId } = req.params;

    const result = await teamService.getTeamStats(teamId);

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
    console.error('Get team stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get team stats'
    });
  }
});

/**
 * GET /api/rooms/:roomId/teams/:teamId/breakdown
 * Get match-wise score breakdown for team
 */
router.get('/:roomId/teams/:teamId/breakdown', async (req, res) => {
  try {
    const { roomId, teamId } = req.params;

    const result = await teamService.getTeamBreakdown(roomId, teamId);

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
    console.error('Get team breakdown error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get team breakdown'
    });
  }
});

/**
 * GET /api/rooms/:roomId/teams/:teamId/export
 * Export team squad summary
 */
router.get('/:roomId/teams/:teamId/export', async (req, res) => {
  try {
    const { roomId, teamId } = req.params;

    const result = await teamService.getTeamExport(roomId, teamId);

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
    console.error('Export team error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export team'
    });
  }
});

module.exports = router;
