/**
 * Leaderboard Page - Live rankings with real-time socket updates
 */

class LeaderboardPage {
  static currentRoomId = null;
  static pollingInterval = null;
  static autoRefreshEnabled = true;
  static matchSyncActive = false;
  static isSocketConnected = false;

  static async init(roomId) {
    this.currentRoomId = roomId;
    this.matchSyncActive = false;
    this.stopPolling();

    // Show navbar
    document.getElementById('navbar').style.display = '';
    this.updateNavbar();

    const template = document.getElementById('leaderboard-page');
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(template.content.cloneNode(true));

    // Setup Socket.io listeners for real-time updates
    this.setupSocketListeners();

    // Setup controls
    const autoRefreshCheckbox = document.getElementById('autoRefresh');
    autoRefreshCheckbox?.addEventListener('change', (e) => {
      this.autoRefreshEnabled = e.target.checked;
      if (this.autoRefreshEnabled) {
        if (!this.isSocketConnected) {
          this.startPolling();
        }
        Utils.showSuccess('Auto-refresh enabled');
      } else {
        this.stopPolling();
        Utils.showSuccess('Auto-refresh disabled');
      }
    });

    const manualRefresh = document.getElementById('manualRefresh');
    manualRefresh?.addEventListener('click', () => {
      this.loadLeaderboard();
    });

    const startSyncBtn = document.getElementById('startSyncBtn');
    startSyncBtn?.addEventListener('click', () => {
      this.showMatchSyncOptions();
    });

    // Load initial data
    await this.loadLeaderboard();

    // Start polling only if socket is not connected
    if (!this.isSocketConnected && this.autoRefreshEnabled) {
      this.startPolling();
    }

    this.updateConnectionStatus();
  }

  static setupSocketListeners() {
    // Check if socket is available
    if (!SocketService) return;

    // Join the room for real-time updates
    SocketService.joinRoom(this.currentRoomId);

    // Listen for leaderboard updates
    SocketService.on('leaderboard-updated', (data) => {
      this.loadLeaderboard();
    });

    // Listen for connection status
    SocketService.on('connect', () => {
      this.isSocketConnected = true;
      this.stopPolling();
      this.updateConnectionStatus();
      Utils.showSuccess('Connected to live updates');
    });

    SocketService.on('disconnect', () => {
      this.isSocketConnected = false;
      if (this.autoRefreshEnabled) {
        this.startPolling();
      }
      this.updateConnectionStatus();
      Utils.showWarning('Live connection lost, using polling');
    });

    this.isSocketConnected = SocketService.isConnected ? SocketService.isConnected() : false;
  }

  static updateNavbar() {
    const user = Utils.getUser();
    const navUser = document.getElementById('navUser');
    if (navUser) {
      navUser.textContent = `👤 ${user.username}`;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', () => {
      Utils.logout();
    });
  }

  static updateConnectionStatus() {
    const statusElement = document.querySelector('.connection-status');
    if (!statusElement) {
      // Add status element if it doesn't exist
      const leaderboardControls = document.querySelector('.leaderboard-controls');
      if (leaderboardControls) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'connection-status';
        leaderboardControls.insertBefore(statusDiv, leaderboardControls.firstChild);
      }
    }

    const status = document.querySelector('.connection-status');
    if (status) {
      if (this.isSocketConnected) {
        status.innerHTML = '<span class="status-badge live">🟢 LIVE</span>';
        status.className = 'connection-status live';
      } else {
        status.innerHTML = '<span class="status-badge polling">🟡 Polling</span>';
        status.className = 'connection-status polling';
      }
    }
  }

  static async loadLeaderboard() {
    const result = await API.getLeaderboard(this.currentRoomId);

    if (result.status === 'success') {
      this.renderLeaderboard(result.data);
    } else {
      Utils.showError(result.message || 'Failed to load leaderboard');
    }
  }

  static renderLeaderboard(data) {
    const tbody = document.getElementById('leaderboardBody');
    const noLeaderboard = document.getElementById('noLeaderboard');

    tbody.innerHTML = '';

    if (!data.teams || data.teams.length === 0) {
      noLeaderboard.style.display = 'block';
      return;
    }

    noLeaderboard.style.display = 'none';

    data.teams.forEach((team, index) => {
      const row = document.createElement('tr');
      row.className = index < 3 ? `rank-${index + 1}` : '';

      const medallion = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;

      row.innerHTML = `
        <td class="rank-cell">${medallion}</td>
        <td>${team.teamName}</td>
        <td class="points-cell"><strong>${team.totalPoints || 0}</strong></td>
        <td>${team.players?.length || 0}</td>
        <td>${team.budgetSpent || 0} / ${team.budgetAllocated || 0}</td>
      `;

      tbody.appendChild(row);
    });

    const matchStatus = document.getElementById('matchStatus');
    if (matchStatus && !this.matchSyncActive) {
      matchStatus.textContent = 'No active match sync';
      matchStatus.style.color = '';
    }
  }

  static startPolling() {
    // Poll every 5 seconds
    this.pollingInterval = setInterval(() => {
      if (this.autoRefreshEnabled) {
        this.loadLeaderboard();
      }
    }, 5000);
  }

  static stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  static async showMatchSyncOptions() {
    const result = await API.getActiveMatches();

    if (result.status === 'success' && result.data && result.data.length > 0) {
      const matches = result.data;

      // Show match selection
      let html = '<div class="match-selection"><h3>Select Match to Sync</h3>';
      matches.forEach(match => {
        html += `
          <button class="match-btn" data-match-id="${match.matchId}">
            ${match.team1} vs ${match.team2}
          </button>
        `;
      });
      html += '</div>';

      // Create temporary container
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      // Add event listeners
      container.querySelectorAll('.match-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const matchId = btn.dataset.matchId;
          container.remove();
          await this.startMatchSync(matchId);
        });
      });
    } else {
      Utils.showError('No active matches available');
    }
  }

  static async startMatchSync(matchId) {
    const result = await API.startMatchSync(matchId, {
      startContinuousSync: true,
      syncIntervalSeconds: 60
    });

    if (result.status === 'success') {
      this.matchSyncActive = true;
      const matchStatus = document.getElementById('matchStatus');
      if (matchStatus) {
        matchStatus.textContent = `🔄 Syncing match ${matchId}... Points updating every 60 seconds`;
        matchStatus.style.color = '#4CAF50';
      }
      Utils.showSuccess('Match sync started! Points will update automatically.');
    } else {
      Utils.showError(result.message || 'Failed to start match sync');
    }
  }

  static destroy() {
    this.stopPolling();
  }
}
