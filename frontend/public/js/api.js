/**
 * API Integration Layer
 * All calls to the backend API go through here
 */

const API_BASE_URL = 'http://localhost:3000';

class API {
  static getToken() {
    return localStorage.getItem('token');
  }

  static getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    };
  }

  // ============= AUTHENTICATION =============

  static async register(username, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: 'Network error: ' + error.message };
    }
  }

  static async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: 'Network error: ' + error.message };
    }
  }

  static async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: 'Network error' };
    }
  }

  // ============= AUCTION ROOMS =============

  static async getRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async getRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async createRoom(roomData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(roomData)
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async updateRoom(roomId, roomData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(roomData)
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async deleteRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async joinRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async leaveRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async joinRoomByCode(inviteCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/join/${encodeURIComponent(inviteCode)}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async getPlayerPool(roomId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.role && filters.role !== 'all') params.set('role', filters.role);
      if (filters.iplTeam && filters.iplTeam !== 'all') params.set('iplTeam', filters.iplTeam);
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/api/rooms/${roomId}/players${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async getAuctionState(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/auction/state`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async readyUp(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/auction/ready`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({})
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async startAuction(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/auction/start`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({})
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async placeBid(roomId, amount) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/auction/bid`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ amount })
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async getTeamBreakdown(roomId, teamId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/teams/${teamId}/breakdown`, {
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async getTeamExport(roomId, teamId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/teams/${teamId}/export`, {
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // ============= TEAMS =============

  static async getTeams(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/teams`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async getTeam(roomId, teamId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/teams/${teamId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async createTeam(roomId, teamData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/teams`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(teamData)
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async addPlayerToTeam(roomId, teamId, playerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/teams/${teamId}/players`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(playerData)
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async removePlayerFromTeam(roomId, teamId, playerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/teams/${teamId}/players/${playerId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async getTeamStats(roomId, teamId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/teams/${teamId}/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // ============= LIVE DATA =============

  static async getLeaderboard(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${roomId}/leaderboard`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async getActiveMatches() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/active`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async getLiveMatch(matchId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/live`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async startMatchSync(matchId, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/sync`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async stopMatchSync(matchId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/stop-sync`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async getPlayerStats(playerName) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players/${playerName}/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async getSystemHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/system/health`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
