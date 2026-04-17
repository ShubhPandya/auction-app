/**
 * Auction Service - Room and Participant Management
 */

const { collections, generateId } = require('../db/database');

/**
 * Generate a unique 6-character alphanumeric invite code
 */
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Generate a unique invite code, retrying if collision occurs
 */
async function uniqueInviteCode(roomsCollection) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateInviteCode();
    const existing = await roomsCollection.findOne({ inviteCode: code });
    if (!existing) return code;
  }
  throw new Error('Could not generate unique invite code');
}

/**
 * Create new auction room
 */
async function createRoom(roomData) {
  try {
    const {
      name,
      description,
      budgetPerTeam,
      maxPlayersPerTeam,
      startDate,
      endDate,
      createdBy,
      auctionConfig
    } = roomData;

    const roomsCollection = collections.auctionRooms();
    const roomId = generateId();
    const now = new Date();
    const inviteCode = await uniqueInviteCode(roomsCollection);

    const room = {
      _id: roomId,
      name,
      description,
      createdBy,
      status: 'draft',
      budgetPerTeam,
      maxPlayersPerTeam,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      participants: [createdBy],
      readyParticipants: [],
      teams: [],
      activeMatches: [],
      inviteCode,
      auctionConfig: {
        bidIncrement: auctionConfig?.bidIncrement ?? 0.25,
        bidTimerSeconds: auctionConfig?.bidTimerSeconds ?? 30,
        nominationOrder: auctionConfig?.nominationOrder ?? 'random',
        unsoldRule: auctionConfig?.unsoldRule ?? 'skip',
        roleComposition: {
          minBatsmen: auctionConfig?.roleComposition?.minBatsmen ?? 3,
          maxBatsmen: auctionConfig?.roleComposition?.maxBatsmen ?? 6,
          minBowlers: auctionConfig?.roleComposition?.minBowlers ?? 3,
          maxBowlers: auctionConfig?.roleComposition?.maxBowlers ?? 6,
          minAllRounders: auctionConfig?.roleComposition?.minAllRounders ?? 1,
          maxAllRounders: auctionConfig?.roleComposition?.maxAllRounders ?? 4,
          minWK: auctionConfig?.roleComposition?.minWK ?? 1,
          maxWK: auctionConfig?.roleComposition?.maxWK ?? 2
        }
      },
      createdAt: now,
      updatedAt: now
    };

    await roomsCollection.insertOne(room);

    console.log(`✅ Auction room created: ${name} (${roomId})`);

    return {
      success: true,
      message: 'Auction room created successfully',
      data: room
    };
  } catch (error) {
    console.error('Create room error:', error);
    return {
      success: false,
      message: 'Failed to create room: ' + error.message
    };
  }
}

/**
 * Get room by ID
 */
async function getRoom(roomId) {
  try {
    const roomsCollection = collections.auctionRooms();
    const usersCollection = collections.users();
    const room = await roomsCollection.findOne({ _id: roomId });

    if (!room) {
      return {
        success: false,
        message: 'Room not found'
      };
    }

    // Populate participant usernames for display, keep IDs for auth checks
    const participantNames = [];
    for (const participantId of (room.participants || [])) {
      const user = await usersCollection.findOne({ _id: participantId });
      participantNames.push(user ? user.username : participantId);
    }

    return {
      success: true,
      data: { ...room, participantNames }
    };
  } catch (error) {
    console.error('Get room error:', error);
    return {
      success: false,
      message: 'Failed to get room: ' + error.message
    };
  }
}

/**
 * List all rooms with optional filter
 */
async function listRooms(filter = {}) {
  try {
    const roomsCollection = collections.auctionRooms();
    const query = {};

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.createdBy) {
      query.$or = [
        { createdBy: filter.createdBy },
        { participants: filter.createdBy }
      ];
    }

    const rooms = await roomsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return {
      success: true,
      data: rooms,
      count: rooms.length
    };
  } catch (error) {
    console.error('List rooms error:', error);
    return {
      success: false,
      message: 'Failed to list rooms: ' + error.message
    };
  }
}

/**
 * Join auction room as participant
 */
async function joinRoom(roomId, userId) {
  try {
    const roomsCollection = collections.auctionRooms();

    const room = await roomsCollection.findOne({ _id: roomId });
    if (!room) {
      return {
        success: false,
        message: 'Room not found'
      };
    }

    // Check if already participant
    if (room.participants.includes(userId)) {
      return {
        success: false,
        message: 'Already a participant in this room'
      };
    }

    // Add user to participants
    await roomsCollection.updateOne(
      { _id: roomId },
      {
        $push: { participants: userId },
        $set: { updatedAt: new Date() }
      }
    );

    console.log(`✅ User ${userId} joined room ${roomId}`);

    return {
      success: true,
      message: 'Successfully joined the room',
      data: { roomId, participants: [...room.participants, userId].length }
    };
  } catch (error) {
    console.error('Join room error:', error);
    return {
      success: false,
      message: 'Failed to join room: ' + error.message
    };
  }
}

/**
 * Leave auction room
 */
async function leaveRoom(roomId, userId) {
  try {
    const roomsCollection = collections.auctionRooms();

    const room = await roomsCollection.findOne({ _id: roomId });
    if (!room) {
      return {
        success: false,
        message: 'Room not found'
      };
    }

    // Prevent creator from leaving
    if (room.createdBy === userId) {
      return {
        success: false,
        message: 'Room creator cannot leave'
      };
    }

    // Remove user from participants and their teams
    await roomsCollection.updateOne(
      { _id: roomId },
      {
        $pull: { participants: userId },
        $set: { updatedAt: new Date() }
      }
    );

    // Remove user's teams from room
    const teamsCollection = collections.teams();
    const userTeams = await teamsCollection
      .find({ roomId, owner: userId })
      .toArray();

    for (const team of userTeams) {
      await teamsCollection.deleteOne({ _id: team._id });
      await roomsCollection.updateOne(
        { _id: roomId },
        { $pull: { teams: team._id } }
      );
    }

    console.log(`✅ User ${userId} left room ${roomId}`);

    return {
      success: true,
      message: 'Successfully left the room'
    };
  } catch (error) {
    console.error('Leave room error:', error);
    return {
      success: false,
      message: 'Failed to leave room: ' + error.message
    };
  }
}

/**
 * Update room
 */
async function updateRoom(roomId, updates, userId) {
  try {
    const roomsCollection = collections.auctionRooms();

    const room = await roomsCollection.findOne({ _id: roomId });
    if (!room) {
      return {
        success: false,
        message: 'Room not found'
      };
    }

    // Only creator can update room
    if (room.createdBy !== userId) {
      return {
        success: false,
        message: 'Only room creator can update the room'
      };
    }

    const allowedUpdates = ['name', 'description', 'status'];
    const updateObj = {};

    for (const key of allowedUpdates) {
      if (key in updates) {
        updateObj[key] = updates[key];
      }
    }

    updateObj.updatedAt = new Date();

    const result = await roomsCollection.updateOne(
      { _id: roomId },
      { $set: updateObj }
    );

    if (result.modifiedCount === 0) {
      return {
        success: false,
        message: 'No changes made'
      };
    }

    console.log(`✅ Room ${roomId} updated`);

    return {
      success: true,
      message: 'Room updated successfully'
    };
  } catch (error) {
    console.error('Update room error:', error);
    return {
      success: false,
      message: 'Failed to update room: ' + error.message
    };
  }
}

/**
 * Delete room
 */
async function deleteRoom(roomId, userId) {
  try {
    const roomsCollection = collections.auctionRooms();
    const teamsCollection = collections.teams();

    const room = await roomsCollection.findOne({ _id: roomId });
    if (!room) {
      return {
        success: false,
        message: 'Room not found'
      };
    }

    // Only creator can delete
    if (room.createdBy !== userId) {
      return {
        success: false,
        message: 'Only room creator can delete the room'
      };
    }

    // Delete all teams in the room
    await teamsCollection.deleteMany({ roomId });

    // Delete room
    await roomsCollection.deleteOne({ _id: roomId });

    console.log(`✅ Room ${roomId} deleted`);

    return {
      success: true,
      message: 'Room deleted successfully'
    };
  } catch (error) {
    console.error('Delete room error:', error);
    return {
      success: false,
      message: 'Failed to delete room: ' + error.message
    };
  }
}

/**
 * Add active match to room (when match starts)
 */
async function addActiveMatch(roomId, matchId) {
  try {
    const roomsCollection = collections.auctionRooms();

    await roomsCollection.updateOne(
      { _id: roomId },
      {
        $addToSet: { activeMatches: matchId },
        $set: { updatedAt: new Date() }
      }
    );

    console.log(`✅ Match ${matchId} added to room ${roomId}`);

    return {
      success: true,
      message: 'Match added to room'
    };
  } catch (error) {
    console.error('Add match error:', error);
    return {
      success: false,
      message: 'Failed to add match: ' + error.message
    };
  }
}

/**
 * Remove match from active matches
 */
async function removeActiveMatch(roomId, matchId) {
  try {
    const roomsCollection = collections.auctionRooms();

    await roomsCollection.updateOne(
      { _id: roomId },
      {
        $pull: { activeMatches: matchId },
        $set: { updatedAt: new Date() }
      }
    );

    return {
      success: true,
      message: 'Match removed from room'
    };
  } catch (error) {
    console.error('Remove match error:', error);
    return {
      success: false,
      message: 'Failed to remove match: ' + error.message
    };
  }
}

/**
 * Find a room by its invite code and optionally join the user
 */
async function joinRoomByInviteCode(inviteCode, userId) {
  try {
    const roomsCollection = collections.auctionRooms();
    const room = await roomsCollection.findOne({ inviteCode: inviteCode.toUpperCase() });

    if (!room) {
      return { success: false, message: 'Invalid invite code' };
    }

    // Auto-join if not already a participant
    if (!room.participants.includes(userId)) {
      await roomsCollection.updateOne(
        { _id: room._id },
        { $push: { participants: userId }, $set: { updatedAt: new Date() } }
      );
      room.participants.push(userId);
    }

    return { success: true, data: { roomId: room._id, room } };
  } catch (error) {
    console.error('Join by invite code error:', error);
    return { success: false, message: 'Failed to join room: ' + error.message };
  }
}

/**
 * Get room player pool with room-specific auction status
 */
async function getRoomPlayerPool(roomId, userId, filters = {}) {
  try {
    const roomsCollection = collections.auctionRooms();
    const playerPoolCollection = collections.playerPool();
    const teamsCollection = collections.teams();

    const room = await roomsCollection.findOne({ _id: roomId });
    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    if (!room.participants.includes(userId)) {
      return { success: false, message: 'Not a participant in this room' };
    }

    const query = {};
    if (filters.role) {
      query.role = filters.role;
    }
    if (filters.iplTeam) {
      query.iplTeam = filters.iplTeam;
    }
    if (filters.search) {
      query.playerName = { $regex: filters.search, $options: 'i' };
    }

    const [players, roomTeams] = await Promise.all([
      playerPoolCollection.find(query).sort({ basePrice: -1, playerName: 1 }).toArray(),
      teamsCollection.find({ roomId }).toArray()
    ]);

    const soldByPlayerName = new Map();
    for (const team of roomTeams) {
      for (const player of (team.players || [])) {
        const key = String(player.playerName || '').toLowerCase();
        if (!key || soldByPlayerName.has(key)) {
          continue;
        }

        soldByPlayerName.set(key, {
          teamName: team.teamName,
          soldPrice: player.purchasePrice || player.basePrice || null
        });
      }
    }

    const normalizedStatus = (filters.status || '').toLowerCase();
    const data = [];

    for (const player of players) {
      const key = String(player.playerName || '').toLowerCase();
      const soldInfo = soldByPlayerName.get(key);

      let auctionStatus = 'available';
      let soldToTeamName = null;
      let soldPrice = null;

      if (soldInfo) {
        auctionStatus = 'sold';
        soldToTeamName = soldInfo.teamName;
        soldPrice = soldInfo.soldPrice;
      } else if (
        player.soldInRoomId === roomId &&
        String(player.status || '').toLowerCase() === 'unsold'
      ) {
        auctionStatus = 'unsold';
      }

      if (normalizedStatus && auctionStatus !== normalizedStatus) {
        continue;
      }

      data.push({
        _id: player._id,
        playerName: player.playerName,
        role: player.role,
        iplTeam: player.iplTeam,
        country: player.country,
        basePrice: player.basePrice,
        auctionStatus,
        soldToTeamName,
        soldPrice
      });
    }

    return { success: true, data, count: data.length };
  } catch (error) {
    console.error('Get room player pool error:', error);
    return { success: false, message: 'Failed to get player pool: ' + error.message };
  }
}

module.exports = {
  createRoom,
  getRoom,
  listRooms,
  joinRoom,
  joinRoomByInviteCode,
  getRoomPlayerPool,
  leaveRoom,
  updateRoom,
  deleteRoom,
  addActiveMatch,
  removeActiveMatch
};
