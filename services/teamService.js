/**
 * Team Service - Team and Player Management
 */

const { collections, generateId } = require('../db/database');

/**
 * Create new team in room
 */
async function createTeam(roomId, teamData, userId) {
  try {
    const { teamName, budgetAllocated } = teamData;

    const teamsCollection = collections.teams();
    const roomsCollection = collections.auctionRooms();

    // Verify room exists
    const room = await roomsCollection.findOne({ _id: roomId });
    if (!room) {
      return {
        success: false,
        message: 'Room not found'
      };
    }

    // Check if user is participant
    if (!room.participants.includes(userId)) {
      return {
        success: false,
        message: 'Not a participant in this room'
      };
    }

    const teamId = generateId();
    const now = new Date();

    const team = {
      _id: teamId,
      roomId,
      teamName,
      owner: userId,
      players: [],
      totalPoints: 0,
      budgetSpent: 0,
      budgetAllocated: budgetAllocated || room.budgetPerTeam,
      budgetRemaining: budgetAllocated || room.budgetPerTeam,
      rank: 0,
      lastUpdated: now,
      createdAt: now,
      updatedAt: now
    };

    await teamsCollection.insertOne(team);

    // Add team to room
    await roomsCollection.updateOne(
      { _id: roomId },
      {
        $push: { teams: teamId },
        $set: { updatedAt: now }
      }
    );

    console.log(`✅ Team created: ${teamName} (${teamId}) in room ${roomId}`);

    return {
      success: true,
      message: 'Team created successfully',
      data: team
    };
  } catch (error) {
    console.error('Create team error:', error);
    return {
      success: false,
      message: 'Failed to create team: ' + error.message
    };
  }
}

/**
 * Get team by ID
 */
async function getTeam(teamId) {
  try {
    const teamsCollection = collections.teams();
    const team = await teamsCollection.findOne({ _id: teamId });

    if (!team) {
      return {
        success: false,
        message: 'Team not found'
      };
    }

    return {
      success: true,
      data: team
    };
  } catch (error) {
    console.error('Get team error:', error);
    return {
      success: false,
      message: 'Failed to get team: ' + error.message
    };
  }
}

/**
 * List all teams in a room
 */
async function listTeams(roomId) {
  try {
    const teamsCollection = collections.teams();

    const teams = await teamsCollection
      .find({ roomId })
      .sort({ totalPoints: -1 })
      .toArray();

    // Add rankings
    teams.forEach((team, index) => {
      team.rank = index + 1;
    });

    return {
      success: true,
      data: teams,
      count: teams.length
    };
  } catch (error) {
    console.error('List teams error:', error);
    return {
      success: false,
      message: 'Failed to list teams: ' + error.message
    };
  }
}

/**
 * Add player to team
 */
async function addPlayerToTeam(teamId, playerData, userId) {
  try {
    const { playerId, playerName, iplTeam, role } = playerData;

    const teamsCollection = collections.teams();
    const playerPoolCollection = collections.playerPool();

    // Get team
    const team = await teamsCollection.findOne({ _id: teamId });
    if (!team) {
      return {
        success: false,
        message: 'Team not found'
      };
    }

    // Check authorization
    if (team.owner !== userId) {
      return {
        success: false,
        message: 'Only team owner can add players'
      };
    }

    // Check team roster size against room's maxPlayersPerTeam
    const roomsCollection = collections.auctionRooms();
    const room = await roomsCollection.findOne({ _id: team.roomId });
    const maxPlayers = room?.maxPlayersPerTeam || 15;
    if (team.players.length >= maxPlayers) {
      return {
        success: false,
        message: `Team roster is full (max ${maxPlayers} players)`
      };
    }

    // Check if player already in team
    if (team.players.some(p => p.playerName === playerName)) {
      return {
        success: false,
        message: 'Player already in team'
      };
    }

    // Check if player is available — only block if drafted by another team in the same room
    const playerInPool = await playerPoolCollection.findOne({ playerName });
    if (playerInPool && playerInPool.status === 'drafted' && playerInPool.draftedBy !== teamId) {
      const draftingTeam = await teamsCollection.findOne({ _id: playerInPool.draftedBy });
      if (draftingTeam && draftingTeam.roomId === team.roomId) {
        return {
          success: false,
          message: 'Player already drafted by another team'
        };
      }
    }

    // Add player to team (auto-populate iplTeam/role from pool if not supplied by caller)
    const newPlayer = {
      playerId: playerId || generateId(),
      playerName,
      iplTeam: iplTeam || (playerInPool ? playerInPool.iplTeam : null),
      role: role || (playerInPool ? playerInPool.role : null),
      purchasedAt: new Date()
    };

    await teamsCollection.updateOne(
      { _id: teamId },
      {
        $push: { players: newPlayer },
        $set: { updatedAt: new Date() }
      }
    );

    // Mark player as drafted in pool (only updates existing pool entries, does not create new ones)
    await playerPoolCollection.updateOne(
      { playerName },
      {
        $set: {
          status: 'drafted',
          draftedBy: teamId,
          draftedAt: new Date()
        }
      }
    );

    console.log(`✅ Player ${playerName} added to team ${teamId}`);

    const updatedTeam = await teamsCollection.findOne({ _id: teamId });
    return {
      success: true,
      message: 'Player added to team successfully',
      data: updatedTeam
    };
  } catch (error) {
    console.error('Add player error:', error);
    return {
      success: false,
      message: 'Failed to add player: ' + error.message
    };
  }
}

/**
 * Remove player from team
 */
async function removePlayerFromTeam(teamId, playerId, userId) {
  try {
    const teamsCollection = collections.teams();
    const playerPoolCollection = collections.playerPool();

    const team = await teamsCollection.findOne({ _id: teamId });
    if (!team) {
      return {
        success: false,
        message: 'Team not found'
      };
    }

    // Check authorization
    if (team.owner !== userId) {
      return {
        success: false,
        message: 'Only team owner can remove players'
      };
    }

    // Find player in team
    const player = team.players.find(p => p.playerId === playerId);
    if (!player) {
      return {
        success: false,
        message: 'Player not in team'
      };
    }

    // Remove player
    await teamsCollection.updateOne(
      { _id: teamId },
      {
        $pull: { players: { playerId } },
        $set: { updatedAt: new Date() }
      }
    );

    // Mark player as available in pool
    await playerPoolCollection.updateOne(
      { playerName: player.playerName },
      {
        $set: {
          status: 'available',
          draftedBy: null,
          draftedAt: null
        }
      }
    );

    console.log(`✅ Player ${player.playerName} removed from team ${teamId}`);

    return {
      success: true,
      message: 'Player removed from team successfully'
    };
  } catch (error) {
    console.error('Remove player error:', error);
    return {
      success: false,
      message: 'Failed to remove player: ' + error.message
    };
  }
}

/**
 * Update team points (called when live match data updates)
 */
async function updateTeamPoints(teamId, pointsIncrease, reason = 'match_update') {
  try {
    const teamsCollection = collections.teams();

    const result = await teamsCollection.updateOne(
      { _id: teamId },
      {
        $inc: { totalPoints: pointsIncrease },
        $set: { lastUpdated: new Date(), updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      return {
        success: false,
        message: 'Team not found'
      };
    }

    console.log(`✅ Team ${teamId} points updated: +${pointsIncrease} (${reason})`);

    return {
      success: true,
      message: 'Points updated successfully'
    };
  } catch (error) {
    console.error('Update points error:', error);
    return {
      success: false,
      message: 'Failed to update points: ' + error.message
    };
  }
}

/**
 * Get team stats with player breakdown
 */
async function getTeamStats(teamId) {
  try {
    const teamsCollection = collections.teams();
    const roomsCollection = collections.auctionRooms();
    const playerStatsCollection = collections.playerStats();

    const team = await teamsCollection.findOne({ _id: teamId });
    if (!team) {
      return {
        success: false,
        message: 'Team not found'
      };
    }

    const room = team.roomId
      ? await roomsCollection.findOne({ _id: team.roomId })
      : null;

    // Get stats for each player
    const playerStats = [];
    for (const teamPlayer of team.players) {
      const stats = await playerStatsCollection.findOne({
        playerName: teamPlayer.playerName
      });

      playerStats.push({
        ...teamPlayer,
        stats: stats || {
          battingPoints: 0,
          bowlingPoints: 0,
          fieldingPoints: 0,
          totalPoints: 0
        }
      });
    }

    return {
      success: true,
      data: {
        teamId,
        teamName: team.teamName,
        owner: team.owner,
        totalPoints: team.totalPoints,
        budgetAllocated: team.budgetAllocated || team.budgetRemaining || 0,
        budgetSpent: team.budgetSpent || 0,
        budgetRemaining: team.budgetRemaining || 0,
        maxPlayersPerTeam: room?.maxPlayersPerTeam || team.maxPlayersPerTeam || 11,
        playerCount: team.players.length,
        players: playerStats
      }
    };
  } catch (error) {
    console.error('Get team stats error:', error);
    return {
      success: false,
      message: 'Failed to get team stats: ' + error.message
    };
  }
}

/**
 * Get match-wise score breakdown for a team
 */
async function getTeamBreakdown(roomId, teamId) {
  try {
    const teamsCollection = collections.teams();
    const pointsLogCollection = collections.pointsLog();

    const team = await teamsCollection.findOne({
      _id: new ObjectId(teamId),
      roomId: new ObjectId(roomId)
    });

    if (!team) {
      return {
        success: false,
        message: 'Team not found'
      };
    }

    // Get all matches this team's players participated in
    const playerNames = team.players.map(p => p.playerName);
    const pointsData = await pointsLogCollection
      .find({ playerName: { $in: playerNames } })
      .sort({ matchId: 1 })
      .toArray();

    // Group by match
    const matchBreakdown = {};
    for (const log of pointsData) {
      if (!matchBreakdown[log.matchId]) {
        matchBreakdown[log.matchId] = {
          matchId: log.matchId,
          players: {},
          teamTotal: 0
        };
      }
      matchBreakdown[log.matchId].players[log.playerName] = {
        batting: log.batting || 0,
        bowling: log.bowling || 0,
        fielding: log.fielding || 0,
        total: log.totalPoints || 0
      };
      matchBreakdown[log.matchId].teamTotal += log.totalPoints || 0;
    }

    return {
      success: true,
      data: Object.values(matchBreakdown)
    };
  } catch (error) {
    console.error('Get team breakdown error:', error);
    return {
      success: false,
      message: 'Failed to get team breakdown: ' + error.message
    };
  }
}

/**
 * Get team export summary
 */
async function getTeamExport(roomId, teamId) {
  try {
    const teamsCollection = collections.teams();
    const roomsCollection = collections.auctionRooms();

    const team = await teamsCollection.findOne({
      _id: new ObjectId(teamId),
      roomId: new ObjectId(roomId)
    });

    if (!team) {
      return {
        success: false,
        message: 'Team not found'
      };
    }

    const room = await roomsCollection.findOne({
      _id: new ObjectId(roomId)
    });

    // Calculate total points
    let totalPoints = 0;
    let budgetSpent = 0;

    for (const player of team.players) {
      totalPoints += player.currentPoints || 0;
      budgetSpent += player.soldPrice || 0;
    }

    const owner = room?.participantNames?.find((name, idx) => 
      room.participants[idx] === team.ownerId
    ) || 'Unknown';

    return {
      success: true,
      data: {
        teamName: team.teamName,
        ownerName: owner,
        roomName: room?.name || 'Unknown',
        totalBudgetAllocated: team.budgetAllocated || 0,
        budgetSpent,
        budgetRemaining: (team.budgetAllocated || 0) - budgetSpent,
        totalPoints,
        players: team.players.map(p => ({
          playerName: p.playerName,
          iplTeam: p.iplTeam || '',
          role: p.role || '',
          country: p.country || 'India',
          basePrice: p.basePrice || 0,
          purchasePrice: p.soldPrice || 0,
          currentPoints: p.currentPoints || 0
        }))
      }
    };
  } catch (error) {
    console.error('Get team export error:', error);
    return {
      success: false,
      message: 'Failed to get team export: ' + error.message
    };
  }
}

module.exports = {
  createTeam,
  getTeam,
  listTeams,
  addPlayerToTeam,
  removePlayerFromTeam,
  updateTeamPoints,
  getTeamStats,
  getTeamBreakdown,
  getTeamExport
};
