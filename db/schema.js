/**
 * MongoDB Schema Definitions for Virtual IPL Auction System
 */

module.exports = {
  // Users Collection
  users: {
    _id: String, // MongoDB ObjectId
    username: String,
    email: String,
    password: String, // bcrypt hashed
    createdAt: Date,
    updatedAt: Date
  },

  // Auction Rooms Collection
  auctionRooms: {
    _id: String, // MongoDB ObjectId
    name: String,
    description: String,
    createdBy: String, // user_id
    // Status: 'draft' | 'waiting' | 'auction_live' | 'auction_complete' | 'scoring' | 'completed'
    status: String,
    budgetPerTeam: Number, // in Cr (e.g., 100 = ₹100 Cr)
    maxPlayersPerTeam: Number, // e.g., 11 or 15
    startDate: Date,
    endDate: Date,
    participants: [String], // array of user_ids
    readyParticipants: [String], // user_ids who have clicked "Mark Ready"
    teams: [String], // array of team_ids
    activeMatches: [String], // array of cricbuzz match_ids being tracked
    inviteCode: String, // 6-char alphanumeric, unique
    auctionConfig: {
      bidIncrement: Number,       // in Cr (e.g., 0.25)
      bidTimerSeconds: Number,    // per-player countdown (e.g., 30)
      nominationOrder: String,    // 'random' | 'base_price_desc'
      unsoldRule: String,         // 'skip' | 'reenter'
      roleComposition: {
        minBatsmen: Number,
        maxBatsmen: Number,
        minBowlers: Number,
        maxBowlers: Number,
        minAllRounders: Number,
        maxAllRounders: Number,
        minWK: Number,
        maxWK: Number
      }
    },
    createdAt: Date,
    updatedAt: Date
  },

  // Teams Collection
  teams: {
    _id: String, // MongoDB ObjectId
    roomId: String, // Reference to auction room
    teamName: String,
    owner: String, // user_id
    budgetAllocated: Number, // in Cr — copied from room.budgetPerTeam at creation
    players: [
      {
        playerId: String,
        playerName: String,
        iplTeam: String,   // e.g., MI, RCB, CSK
        role: String,      // 'Batsman' | 'Bowler' | 'AllRounder' | 'WicketKeeper'
        basePrice: Number, // in Cr
        purchasePrice: Number, // in Cr — amount paid at auction
        purchasedAt: Date
      }
    ],
    // Role counts (auto-maintained by auction engine)
    roleCounts: {
      Batsman: Number,
      Bowler: Number,
      AllRounder: Number,
      WicketKeeper: Number
    },
    totalPoints: Number,
    budgetSpent: Number,    // in Cr
    budgetRemaining: Number, // in Cr
    isReady: Boolean,        // true once owner clicks "Mark Ready"
    rank: Number,
    lastUpdated: Date,
    createdAt: Date,
    updatedAt: Date
  },

  // Live Match Data Cache
  liveMatches: {
    _id: String,         // MongoDB ObjectId
    matchNo: Number,     // sequential match number (e.g., 1–74)
    cricbuzzMatchId: String, // Cricbuzz match ID for v2 API calls
    matchName: String,   // e.g., "MI vs CSK, 1st Match"
    team1: String,
    team2: String,
    status: String,      // 'upcoming' | 'live' | 'completed'
    venue: String,
    matchDate: String,   // "DD/MM/YYYY" as stored in match_ids.json
    matchTime: String,   // "07:30 PM"
    matchResult: String, // raw result string from Cricbuzz
    currentInnings: Number,
    currentOver: String,
    score: Number,
    wickets: Number,
    batting: [
      {
        playerName: String,
        runs: Number,
        balls: Number,
        fours: Number,
        sixes: Number,
        dismissal: String
      }
    ],
    bowling: [
      {
        playerName: String,
        wickets: Number,
        runs: Number,
        overs: String,
        maidens: Number,
        dotBalls: Number
      }
    ],
    playing11Innings1: [String],
    playing11Innings2: [String],
    toss: {
      wonBy: String,
      chosenTo: String
    },
    result: String,
    lastSyncTime: Date,
    createdAt: Date,
    updatedAt: Date
  },

  // Player Stats Tracking (accumulation of points)
  playerStats: {
    _id: String, // MongoDB ObjectId
    playerId: String,
    playerName: String,
    iplTeam: String,
    role: String,
    totalRuns: Number,
    totalFours: Number,
    totalSixes: Number,
    totalWickets: Number,
    totalCatches: Number,
    totalRunOuts: Number,
    totalStumpings: Number,
    battingPoints: Number,
    bowlingPoints: Number,
    fieldingPoints: Number,
    totalPoints: Number,
    // Per-match breakdown for leaderboard drill-down
    matchBreakdown: [
      {
        matchId: String,
        cricbuzzMatchId: String,
        matchName: String,
        matchDate: String,
        opponent: String,
        runs: Number,
        balls: Number,
        fours: Number,
        sixes: Number,
        sr: Number,
        wickets: Number,
        overs: Number,
        economy: Number,
        catches: Number,
        runOuts: Number,
        stumpings: Number,
        battingPoints: Number,
        bowlingPoints: Number,
        fieldingPoints: Number,
        totalPoints: Number
      }
    ],
    lastUpdated: Date,
    createdAt: Date,
    updatedAt: Date
  },

  // Points Accumulation Log
  pointsLog: {
    _id: String, // MongoDB ObjectId
    roomId: String,
    teamId: String,
    playerId: String,
    playerName: String,
    matchId: String,
    cricbuzzMatchId: String,
    matchName: String,
    matchDate: Date,
    battingPoints: Number,
    bowlingPoints: Number,
    fieldingPoints: Number,
    totalPoints: Number,
    previousTeamTotal: Number,
    newTeamTotal: Number,
    timestamp: Date,
    createdAt: Date
  },

  // Player Pool — full IPL 2026 roster available for auction
  playerPool: {
    _id: String, // MongoDB ObjectId
    playerName: String,         // display name
    cricbuzzName: String,       // name as it appears in Cricbuzz scorecards
    iplTeam: String,            // real IPL team: MI / CSK / RCB / KKR / DC / PBKS / RR / SRH / LSG / GT
    role: String,               // 'Batsman' | 'Bowler' | 'AllRounder' | 'WicketKeeper'
    country: String,
    basePrice: Number,          // fantasy auction base price in Cr (e.g., 2, 1, 0.5, 0.2)
    status: String,             // global status: 'available' | 'sold' | 'unsold'
    soldPrice: Number,          // Cr — set when sold
    soldToTeamId: String,       // fantasy team_id that won
    soldToTeamName: String,
    soldInRoomId: String,       // auction room where sold
    soldAt: Date,
    createdAt: Date,
    updatedAt: Date
  },

  // Auction Session — one document per room, tracks live auction state
  auctionSession: {
    _id: String,          // MongoDB ObjectId
    roomId: String,       // Reference to auctionRooms
    state: String,        // 'WAITING_FOR_PARTICIPANTS' | 'AUCTION_LIVE' | 'PLAYER_NOMINATED' |
                          // 'BIDDING_OPEN' | 'PLAYER_SOLD' | 'PLAYER_UNSOLD' |
                          // 'UNSOLD_REENTRY' | 'AUCTION_COMPLETE'
    nominationQueue: [String],  // ordered array of playerPool _id strings
    currentQueueIndex: Number,  // index into nominationQueue
    currentPlayerId: String,    // playerPool _id of player on the block
    currentPlayerName: String,
    currentBasePrice: Number,   // in Cr — may be 50% of basePrice in reentry round
    currentPrice: Number,       // current highest bid in Cr
    currentWinnerId: String,    // user_id of current highest bidder
    currentWinnerTeamId: String,
    currentWinnerName: String,
    timerExpiry: Date,          // server timestamp when timer expires
    timerSeconds: Number,       // snapshot of config timer at session start
    unsoldPool: [String],       // playerPool _id strings for unsold round
    isReentryRound: Boolean,
    soldPlayers: [              // summary of sold players in this session
      {
        playerId: String,
        playerName: String,
        soldToTeamId: String,
        soldToTeamName: String,
        soldPrice: Number
      }
    ],
    unsoldPlayers: [String],    // playerPool _id strings of permanently unsold
    startedAt: Date,
    completedAt: Date,
    createdAt: Date,
    updatedAt: Date
  },

  // Bids — every bid placed during an auction
  bids: {
    _id: String,           // MongoDB ObjectId
    roomId: String,
    sessionId: String,     // auctionSession _id
    playerId: String,      // playerPool _id of player being bid on
    playerName: String,
    bidderId: String,      // user_id
    bidderTeamId: String,
    bidderName: String,
    amount: Number,        // bid amount in Cr
    isWinning: Boolean,    // true if this bid is the current highest
    serverTimestamp: Date, // authoritative server time
    createdAt: Date
  }
};
