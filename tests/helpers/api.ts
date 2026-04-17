/**
 * API helper functions for direct backend testing
 * These can be used to set up test data or verify backend state
 */

const BASE_URL = 'http://localhost:3000';

interface AuthResponse {
  status: string;
  data?: {
    userId: string;
    username: string;
    email: string;
    token: string;
  };
  message?: string;
}

interface RoomResponse {
  status: string;
  data?: any;
  message?: string;
}

export class ApiHelper {
  private token: string | null = null;

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    if (data.status === 'success' && data.data?.token) {
      this.token = data.data.token;
    }
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.status === 'success' && data.data?.token) {
      this.token = data.data.token;
    }
    return data;
  }

  async createRoom(roomData: any): Promise<RoomResponse> {
    if (!this.token) throw new Error('Not authenticated');
    
    // Normalize field names to match backend expectations
    const payload = {
      name: roomData.name || roomData.roomName,
      description: roomData.description || roomData.roomDescription || '',
      budgetPerTeam: roomData.budgetPerTeam,
      maxPlayersPerTeam: roomData.maxPlayersPerTeam,
      startDate: roomData.startDate,
      endDate: roomData.endDate,
      auctionConfig: roomData.auctionConfig
    };
    
    const response = await fetch(`${BASE_URL}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(payload)
    });
    
    return await response.json();
  }

  async createTeam(roomId: string, teamData: any): Promise<RoomResponse> {
    if (!this.token) throw new Error('Not authenticated');
    
    const response = await fetch(`${BASE_URL}/api/rooms/${roomId}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(teamData)
    });
    
    return await response.json();
  }

  async getRooms(): Promise<RoomResponse> {
    if (!this.token) throw new Error('Not authenticated');
    
    const response = await fetch(`${BASE_URL}/api/rooms`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    
    return await response.json();
  }

  async joinRoom(inviteCode: string): Promise<RoomResponse> {
    if (!this.token) throw new Error('Not authenticated');
    
    const response = await fetch(`${BASE_URL}/api/rooms/join/${inviteCode}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    
    return await response.json();
  }

  async cleanup() {
    this.token = null;
  }

  getToken(): string | null {
    return this.token;
  }
}
