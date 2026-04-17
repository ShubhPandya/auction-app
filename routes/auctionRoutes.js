/**
 * Auction Routes - Room Management
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const auctionService = require('../services/auctionService');
const auctionEngine = require('../services/auctionEngine');

// Protect all routes with auth middleware
router.use(auth.authMiddleware);

/**
 * POST /api/rooms
 * Create new auction room
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, budgetPerTeam, maxPlayersPerTeam, startDate, endDate, auctionConfig } = req.body;

    // Validation
    if (!name || !budgetPerTeam || !maxPlayersPerTeam) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, budget, and max players are required'
      });
    }

    const result = await auctionService.createRoom({
      name,
      description: description || '',
      budgetPerTeam,
      maxPlayersPerTeam,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: req.userId,
      auctionConfig: auctionConfig || {}
    });

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
    console.error('Create room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create room'
    });
  }
});

/**
 * GET /api/rooms
 * List all rooms
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    const result = await auctionService.listRooms({
      status: status || null,
      createdBy: req.userId
    });

    res.status(200).json({
      status: 'success',
      data: result.data,
      count: result.count
    });
  } catch (error) {
    console.error('List rooms error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to list rooms'
    });
  }
});

/**
 * GET /api/rooms/join/:inviteCode
 * Look up a room by invite code and auto-join the requesting user
 */
router.get('/join/:inviteCode', async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const result = await auctionService.joinRoomByInviteCode(inviteCode, req.userId);

    if (!result.success) {
      return res.status(404).json({ status: 'error', message: result.message });
    }

    res.status(200).json({
      status: 'success',
      data: { roomId: result.data.roomId, room: result.data.room }
    });
  } catch (error) {
    console.error('Join by invite code error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to join room' });
  }
});

/**
 * GET /api/rooms/:roomId/players
 * Get full player pool with room-specific auction status
 */
router.get('/:roomId/players', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { role, iplTeam, search, status } = req.query;

    const result = await auctionService.getRoomPlayerPool(
      roomId,
      req.userId,
      {
        role: role || null,
        iplTeam: iplTeam || null,
        search: search || null,
        status: status || null
      }
    );

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.message
      });
    }

    res.status(200).json({
      status: 'success',
      data: result.data,
      count: result.count
    });
  } catch (error) {
    console.error('Get room players error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get player pool'
    });
  }
});

/**
 * POST /api/rooms/:roomId/auction/ready
 * Mark current user as ready for auction
 */
router.post('/:roomId/auction/ready', async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await auctionEngine.setReady(roomId, req.userId);

    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Auction ready error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to set ready state' });
  }
});

/**
 * POST /api/rooms/:roomId/auction/start
 * Start auction when all participants are ready
 */
router.post('/:roomId/auction/start', async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await auctionEngine.startAuction(roomId, req.userId);

    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }

    res.status(200).json({ status: 'success', message: result.message });
  } catch (error) {
    console.error('Auction start error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to start auction' });
  }
});

/**
 * POST /api/rooms/:roomId/auction/bid
 * Place bid on current nominated player
 */
router.post('/:roomId/auction/bid', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { amount } = req.body;
    const result = await auctionEngine.placeBid(roomId, req.userId, amount);

    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: result.data || null
    });
  } catch (error) {
    console.error('Auction bid error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to place bid' });
  }
});

/**
 * GET /api/rooms/:roomId/auction/state
 * Get current auction state snapshot for a room
 */
router.get('/:roomId/auction/state', async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await auctionEngine.getCurrentState(roomId);

    if (!result.success) {
      return res.status(404).json({ status: 'error', message: result.message });
    }

    res.status(200).json({ status: 'success', data: result.data });
  } catch (error) {
    console.error('Auction state error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get auction state' });
  }
});

/**
 * GET /api/rooms/:roomId
 * Get room details
 */
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const result = await auctionService.getRoom(roomId);

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
    console.error('Get room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get room'
    });
  }
});

/**
 * PUT /api/rooms/:roomId
 * Update room
 */
router.put('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name, description, status } = req.body;

    const result = await auctionService.updateRoom(
      roomId,
      { name, description, status },
      req.userId
    );

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
    console.error('Update room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update room'
    });
  }
});

/**
 * DELETE /api/rooms/:roomId
 * Delete room
 */
router.delete('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const result = await auctionService.deleteRoom(roomId, req.userId);

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
    console.error('Delete room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete room'
    });
  }
});

/**
 * POST /api/rooms/:roomId/join
 * Join room
 */
router.post('/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;

    const result = await auctionService.joinRoom(roomId, req.userId);

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.message
      });
    }

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to join room'
    });
  }
});

/**
 * POST /api/rooms/:roomId/leave
 * Leave room
 */
router.post('/:roomId/leave', async (req, res) => {
  try {
    const { roomId } = req.params;

    const result = await auctionService.leaveRoom(roomId, req.userId);

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
    console.error('Leave room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to leave room'
    });
  }
});

module.exports = router;
