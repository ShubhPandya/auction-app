/**
 * Auction Engine - Server-authoritative auction state machine
 */

const { collections, generateId } = require('../db/database');
const socketService = require('./socketService');

const ROOM_STATES = {
  ROOM_SETUP: 'ROOM_SETUP',
  WAITING_FOR_PARTICIPANTS: 'WAITING_FOR_PARTICIPANTS',
  AUCTION_LIVE: 'AUCTION_LIVE',
  PLAYER_NOMINATED: 'PLAYER_NOMINATED',
  BIDDING_OPEN: 'BIDDING_OPEN',
  PLAYER_SOLD: 'PLAYER_SOLD',
  PLAYER_UNSOLD: 'PLAYER_UNSOLD',
  UNSOLD_REENTRY: 'UNSOLD_REENTRY',
  AUCTION_COMPLETE: 'AUCTION_COMPLETE'
};

const expiryTimers = new Map();
const tickTimers = new Map();
const recentBidMap = new Map();

function clearTimers(roomId) {
  const expiry = expiryTimers.get(roomId);
  if (expiry) {
    clearTimeout(expiry);
    expiryTimers.delete(roomId);
  }

  const tick = tickTimers.get(roomId);
  if (tick) {
    clearInterval(tick);
    tickTimers.delete(roomId);
  }
}

function startTickBroadcast(roomId, timerExpiry) {
  const existing = tickTimers.get(roomId);
  if (existing) {
    clearInterval(existing);
  }

  const interval = setInterval(() => {
    const remaining = Math.max(0, Math.ceil((new Date(timerExpiry).getTime() - Date.now()) / 1000));

    socketService.emitToRoom(roomId, 'timer-tick', {
      roomId,
      remainingSeconds: remaining
    });

    if (remaining <= 0) {
      clearInterval(interval);
      tickTimers.delete(roomId);
    }
  }, 1000);

  tickTimers.set(roomId, interval);
}

function computeRoleCount(players, roleName) {
  return (players || []).filter((p) => p.role === roleName).length;
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function getCurrentState(roomId) {
  const sessionsCollection = collections.auctionSession();
  const session = await sessionsCollection.findOne({ roomId });

  if (!session) {
    return {
      success: false,
      message: 'Auction session not found'
    };
  }

  return {
    success: true,
    data: session
  };
}

async function setReady(roomId, userId) {
  try {
    const roomsCollection = collections.auctionRooms();
    const room = await roomsCollection.findOne({ _id: roomId });

    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    if (!room.participants.includes(userId)) {
      return { success: false, message: 'Not a participant in this room' };
    }

    await roomsCollection.updateOne(
      { _id: roomId },
      {
        $addToSet: { readyParticipants: userId },
        $set: { status: ROOM_STATES.WAITING_FOR_PARTICIPANTS, updatedAt: new Date() }
      }
    );

    const updatedRoom = await roomsCollection.findOne({ _id: roomId });
    const readyCount = updatedRoom.readyParticipants?.length || 0;
    const participantCount = updatedRoom.participants?.length || 0;

    socketService.emitToRoom(roomId, 'participant-ready', {
      roomId,
      userId,
      readyCount,
      participantCount
    });

    if (participantCount > 0 && readyCount === participantCount) {
      socketService.emitToRoom(roomId, 'all-ready', { roomId });
      socketService.emitToRoom(roomId, 'all-participants-ready', { roomId });
    }

    return {
      success: true,
      message: 'Marked as ready',
      data: {
        roomId,
        readyParticipants: updatedRoom.readyParticipants,
        readyCount,
        participantCount
      }
    };
  } catch (error) {
    console.error('setReady error:', error);
    return { success: false, message: 'Failed to set ready: ' + error.message };
  }
}

async function buildNominationQueue(room) {
  const playerPoolCollection = collections.playerPool();

  const basePlayers = await playerPoolCollection
    .find({
      $or: [
        { soldInRoomId: { $ne: room._id } },
        { soldInRoomId: { $exists: false } }
      ]
    })
    .project({ _id: 1, basePrice: 1 })
    .toArray();

  const order = room.auctionConfig?.nominationOrder || 'random';

  if (order === 'base_price_desc') {
    basePlayers.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
  } else {
    return shuffle(basePlayers).map((p) => p._id);
  }

  return basePlayers.map((p) => p._id);
}

async function startAuction(roomId, userId) {
  try {
    const roomsCollection = collections.auctionRooms();
    const sessionsCollection = collections.auctionSession();

    const room = await roomsCollection.findOne({ _id: roomId });
    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    if (!room.participants.includes(userId)) {
      return { success: false, message: 'Not a participant in this room' };
    }

    const readyCount = room.readyParticipants?.length || 0;
    const participantCount = room.participants?.length || 0;
    if (participantCount === 0 || readyCount !== participantCount) {
      return {
        success: false,
        message: 'All participants must be ready before starting auction'
      };
    }

    const existingSession = await sessionsCollection.findOne({ roomId });
    if (existingSession && existingSession.state !== ROOM_STATES.AUCTION_COMPLETE) {
      return { success: false, message: 'Auction already started for this room' };
    }

    const nominationQueue = await buildNominationQueue(room);
    const now = new Date();

    const sessionDoc = {
      _id: generateId(),
      roomId,
      state: ROOM_STATES.AUCTION_LIVE,
      nominationQueue,
      currentQueueIndex: -1,
      currentPlayerId: null,
      currentPlayerName: null,
      currentBasePrice: 0,
      currentPrice: 0,
      currentWinnerId: null,
      currentWinnerTeamId: null,
      currentWinnerName: null,
      timerExpiry: null,
      timerSeconds: room.auctionConfig?.bidTimerSeconds || 30,
      unsoldPool: [],
      isReentryRound: false,
      soldPlayers: [],
      unsoldPlayers: [],
      startedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now
    };

    await sessionsCollection.deleteMany({ roomId });
    await sessionsCollection.insertOne(sessionDoc);

    await roomsCollection.updateOne(
      { _id: roomId },
      { $set: { status: ROOM_STATES.AUCTION_LIVE, updatedAt: now } }
    );

    socketService.emitToRoom(roomId, 'auction-started', {
      roomId,
      state: ROOM_STATES.AUCTION_LIVE,
      queueSize: nominationQueue.length
    });

    await nominateNextPlayer(roomId);

    return {
      success: true,
      message: 'Auction started successfully'
    };
  } catch (error) {
    console.error('startAuction error:', error);
    return { success: false, message: 'Failed to start auction: ' + error.message };
  }
}

async function nominateNextPlayer(roomId) {
  try {
    const sessionsCollection = collections.auctionSession();
    const roomsCollection = collections.auctionRooms();
    const playerPoolCollection = collections.playerPool();

    const [session, room] = await Promise.all([
      sessionsCollection.findOne({ roomId }),
      roomsCollection.findOne({ _id: roomId })
    ]);

    if (!session || !room) {
      return { success: false, message: 'Auction session or room not found' };
    }

    let nominationQueue = session.nominationQueue || [];
    let currentQueueIndex = session.currentQueueIndex ?? -1;
    let isReentryRound = !!session.isReentryRound;

    const nextIndex = currentQueueIndex + 1;
    if (nextIndex >= nominationQueue.length) {
      const canReenter = room.auctionConfig?.unsoldRule === 'reenter' && (session.unsoldPool || []).length > 0 && !isReentryRound;

      if (canReenter) {
        nominationQueue = [...session.unsoldPool];
        currentQueueIndex = -1;
        isReentryRound = true;

        await sessionsCollection.updateOne(
          { roomId },
          {
            $set: {
              state: ROOM_STATES.UNSOLD_REENTRY,
              nominationQueue,
              currentQueueIndex,
              unsoldPool: [],
              isReentryRound: true,
              updatedAt: new Date()
            }
          }
        );

        socketService.emitToRoom(roomId, 'unsold-reentry-started', {
          roomId,
          queueSize: nominationQueue.length
        });

        return nominateNextPlayer(roomId);
      }

      return handleAuctionEnd(roomId);
    }

    const playerId = nominationQueue[nextIndex];
    const player = await playerPoolCollection.findOne({ _id: playerId });
    if (!player) {
      await sessionsCollection.updateOne(
        { roomId },
        { $set: { currentQueueIndex: nextIndex, updatedAt: new Date() } }
      );
      return nominateNextPlayer(roomId);
    }

    const basePrice = isReentryRound
      ? Math.max(0.1, Math.round((player.basePrice || 0.5) * 50) / 100)
      : (player.basePrice || 0.5);

    const timerSeconds = room.auctionConfig?.bidTimerSeconds || session.timerSeconds || 30;
    const timerExpiry = new Date(Date.now() + (timerSeconds * 1000));

    await sessionsCollection.updateOne(
      { roomId },
      {
        $set: {
          state: ROOM_STATES.BIDDING_OPEN,
          nominationQueue,
          currentQueueIndex: nextIndex,
          currentPlayerId: player._id,
          currentPlayerName: player.playerName,
          currentBasePrice: basePrice,
          currentPrice: basePrice,
          currentWinnerId: null,
          currentWinnerTeamId: null,
          currentWinnerName: null,
          timerSeconds,
          timerExpiry,
          isReentryRound,
          updatedAt: new Date()
        }
      }
    );

    clearTimers(roomId);
    startTickBroadcast(roomId, timerExpiry);

    expiryTimers.set(
      roomId,
      setTimeout(() => {
        handleTimerExpiry(roomId).catch((err) => {
          console.error('handleTimerExpiry timer callback error:', err);
        });
      }, timerSeconds * 1000)
    );

    socketService.emitToRoom(roomId, 'player-nominated', {
      roomId,
      state: ROOM_STATES.BIDDING_OPEN,
      player: {
        playerId: player._id,
        playerName: player.playerName,
        role: player.role,
        iplTeam: player.iplTeam,
        country: player.country,
        basePrice
      },
      timerSeconds,
      currentPrice: basePrice,
      currentWinnerName: null,
      isReentryRound
    });

    return { success: true, message: 'Player nominated' };
  } catch (error) {
    console.error('nominateNextPlayer error:', error);
    return { success: false, message: 'Failed to nominate next player: ' + error.message };
  }
}

async function placeBid(roomId, userId, amount) {
  try {
    const sessionsCollection = collections.auctionSession();
    const roomsCollection = collections.auctionRooms();
    const teamsCollection = collections.teams();
    const usersCollection = collections.users();
    const bidsCollection = collections.bids();
    const playerPoolCollection = collections.playerPool();

    const bidAmount = Number(amount);
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
      return { success: false, message: 'Invalid bid amount' };
    }

    const dedupeKey = `${roomId}:${userId}`;
    const nowTs = Date.now();
    const lastBidTs = recentBidMap.get(dedupeKey);
    if (lastBidTs && (nowTs - lastBidTs) <= 500) {
      return { success: true, message: 'Duplicate bid ignored', data: { deduped: true } };
    }
    recentBidMap.set(dedupeKey, nowTs);

    const [session, room, bidderTeam, bidderUser] = await Promise.all([
      sessionsCollection.findOne({ roomId }),
      roomsCollection.findOne({ _id: roomId }),
      teamsCollection.findOne({ roomId, owner: userId }),
      usersCollection.findOne({ _id: userId })
    ]);

    if (!session || !room) {
      return { success: false, message: 'Auction session not found' };
    }
    if (session.state !== ROOM_STATES.BIDDING_OPEN) {
      return { success: false, message: 'Bidding is currently closed' };
    }
    if (!bidderTeam) {
      return { success: false, message: 'You need a team in this room to bid' };
    }
    if (session.currentWinnerId === userId) {
      return { success: false, message: 'Current highest bidder cannot bid again' };
    }

    const increment = Number(room.auctionConfig?.bidIncrement || 0.25);
    const expectedBid = Number(session.currentPrice) + increment;
    if (Math.abs(bidAmount - expectedBid) > 0.00001) {
      return { success: false, message: `Bid must be exactly ${expectedBid} Cr` };
    }

    if ((bidderTeam.budgetRemaining || 0) < bidAmount) {
      return { success: false, message: 'Insufficient purse for this bid' };
    }

    const maxPlayers = Number(room.maxPlayersPerTeam || 11);
    if ((bidderTeam.players || []).length >= maxPlayers) {
      return { success: false, message: 'Squad already full' };
    }

    const player = await playerPoolCollection.findOne({ _id: session.currentPlayerId });
    if (!player) {
      return { success: false, message: 'Current player not found' };
    }

    const roleComposition = room.auctionConfig?.roleComposition || {};
    const roleMaxMap = {
      Batsman: Number(roleComposition.maxBatsmen || maxPlayers),
      Bowler: Number(roleComposition.maxBowlers || maxPlayers),
      AllRounder: Number(roleComposition.maxAllRounders || maxPlayers),
      WicketKeeper: Number(roleComposition.maxWK || maxPlayers)
    };

    const roleCount = computeRoleCount(bidderTeam.players, player.role);
    if (roleCount >= (roleMaxMap[player.role] || maxPlayers)) {
      return { success: false, message: `Role limit reached for ${player.role}` };
    }

    await bidsCollection.insertOne({
      _id: generateId(),
      roomId,
      sessionId: session._id,
      playerId: session.currentPlayerId,
      playerName: session.currentPlayerName,
      bidderId: userId,
      bidderTeamId: bidderTeam._id,
      bidderName: bidderUser?.username || 'Bidder',
      amount: bidAmount,
      isWinning: true,
      serverTimestamp: new Date(),
      createdAt: new Date()
    });

    const timerSeconds = Number(session.timerSeconds || room.auctionConfig?.bidTimerSeconds || 30);
    const timerExpiry = new Date(Date.now() + timerSeconds * 1000);

    await sessionsCollection.updateOne(
      { roomId },
      {
        $set: {
          currentPrice: bidAmount,
          currentWinnerId: userId,
          currentWinnerTeamId: bidderTeam._id,
          currentWinnerName: bidderUser?.username || 'Bidder',
          timerExpiry,
          updatedAt: new Date()
        }
      }
    );

    clearTimers(roomId);
    startTickBroadcast(roomId, timerExpiry);

    expiryTimers.set(
      roomId,
      setTimeout(() => {
        handleTimerExpiry(roomId).catch((err) => {
          console.error('handleTimerExpiry timer callback error:', err);
        });
      }, timerSeconds * 1000)
    );

    socketService.emitToRoom(roomId, 'bid-placed', {
      roomId,
      playerId: session.currentPlayerId,
      amount: bidAmount,
      bidderId: userId,
      bidderName: bidderUser?.username || 'Bidder',
      bidderTeamId: bidderTeam._id,
      timerSeconds,
      timerExpiry
    });

    return { success: true, message: 'Bid placed successfully' };
  } catch (error) {
    console.error('placeBid error:', error);
    return { success: false, message: 'Failed to place bid: ' + error.message };
  }
}

async function handleTimerExpiry(roomId) {
  try {
    const sessionsCollection = collections.auctionSession();
    const roomsCollection = collections.auctionRooms();
    const teamsCollection = collections.teams();
    const playerPoolCollection = collections.playerPool();

    clearTimers(roomId);

    const [session, room] = await Promise.all([
      sessionsCollection.findOne({ roomId }),
      roomsCollection.findOne({ _id: roomId })
    ]);

    if (!session || !room || session.state !== ROOM_STATES.BIDDING_OPEN) {
      return { success: true, message: 'No active bidding session' };
    }

    const player = await playerPoolCollection.findOne({ _id: session.currentPlayerId });
    if (!player) {
      await nominateNextPlayer(roomId);
      return { success: true, message: 'Player missing, moved to next nomination' };
    }

    if (session.currentWinnerTeamId) {
      const winningTeam = await teamsCollection.findOne({ _id: session.currentWinnerTeamId });
      if (!winningTeam) {
        await nominateNextPlayer(roomId);
        return { success: true, message: 'Winning team missing, moved forward' };
      }

      const soldPrice = Number(session.currentPrice);
      const now = new Date();

      const newPlayer = {
        playerId: player._id,
        playerName: player.playerName,
        iplTeam: player.iplTeam,
        role: player.role,
        basePrice: player.basePrice,
        purchasePrice: soldPrice,
        purchasedAt: now
      };

      await teamsCollection.updateOne(
        { _id: winningTeam._id },
        {
          $push: { players: newPlayer },
          $inc: { budgetSpent: soldPrice, budgetRemaining: -soldPrice },
          $set: { updatedAt: now }
        }
      );

      await playerPoolCollection.updateOne(
        { _id: player._id },
        {
          $set: {
            status: 'sold',
            soldPrice,
            soldToTeamId: winningTeam._id,
            soldToTeamName: winningTeam.teamName,
            soldInRoomId: roomId,
            soldAt: now,
            updatedAt: now
          }
        }
      );

      await sessionsCollection.updateOne(
        { roomId },
        {
          $set: {
            state: ROOM_STATES.PLAYER_SOLD,
            updatedAt: now
          },
          $push: {
            soldPlayers: {
              playerId: player._id,
              playerName: player.playerName,
              soldToTeamId: winningTeam._id,
              soldToTeamName: winningTeam.teamName,
              soldPrice
            }
          }
        }
      );

      socketService.emitToRoom(roomId, 'player-sold', {
        roomId,
        playerId: player._id,
        playerName: player.playerName,
        soldToTeamId: winningTeam._id,
        soldToTeamName: winningTeam.teamName,
        soldPrice
      });
    } else {
      const now = new Date();

      await playerPoolCollection.updateOne(
        { _id: player._id },
        {
          $set: {
            status: 'unsold',
            soldInRoomId: roomId,
            updatedAt: now
          }
        }
      );

      await sessionsCollection.updateOne(
        { roomId },
        {
          $set: { state: ROOM_STATES.PLAYER_UNSOLD, updatedAt: now },
          $push: {
            unsoldPool: player._id,
            unsoldPlayers: player._id
          }
        }
      );

      socketService.emitToRoom(roomId, 'player-unsold', {
        roomId,
        playerId: player._id,
        playerName: player.playerName
      });
    }

    setTimeout(() => {
      nominateNextPlayer(roomId).catch((error) => {
        console.error('nominateNextPlayer after expiry error:', error);
      });
    }, 3000);

    return { success: true, message: 'Timer expiry handled' };
  } catch (error) {
    console.error('handleTimerExpiry error:', error);
    return { success: false, message: 'Failed to handle timer expiry: ' + error.message };
  }
}

async function handleAuctionEnd(roomId) {
  try {
    const sessionsCollection = collections.auctionSession();
    const roomsCollection = collections.auctionRooms();
    const teamsCollection = collections.teams();

    clearTimers(roomId);

    const [session, teams] = await Promise.all([
      sessionsCollection.findOne({ roomId }),
      teamsCollection.find({ roomId }).project({ _id: 1, teamName: 1, owner: 1, budgetRemaining: 1, players: 1, totalPoints: 1 }).toArray()
    ]);

    await sessionsCollection.updateOne(
      { roomId },
      {
        $set: {
          state: ROOM_STATES.AUCTION_COMPLETE,
          completedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    await roomsCollection.updateOne(
      { _id: roomId },
      {
        $set: {
          status: ROOM_STATES.AUCTION_COMPLETE,
          updatedAt: new Date()
        }
      }
    );

    socketService.emitToRoom(roomId, 'auction-complete', {
      roomId,
      soldPlayers: session?.soldPlayers || [],
      unsoldPlayers: session?.unsoldPlayers || [],
      squads: teams.map((team) => ({
        teamId: team._id,
        teamName: team.teamName,
        owner: team.owner,
        budgetRemaining: team.budgetRemaining,
        players: team.players || [],
        totalPoints: team.totalPoints || 0
      }))
    });

    return { success: true, message: 'Auction complete' };
  } catch (error) {
    console.error('handleAuctionEnd error:', error);
    return { success: false, message: 'Failed to complete auction: ' + error.message };
  }
}

module.exports = {
  ROOM_STATES,
  setReady,
  startAuction,
  nominateNextPlayer,
  placeBid,
  handleTimerExpiry,
  handleAuctionEnd,
  getCurrentState
};
