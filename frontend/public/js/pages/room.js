/**
 * Room Details Page
 */

class RoomPage {
  static currentRoomId = null;
  static currentRoom = null;
  static currentTeams = [];

  static async init(roomId) {
    this.currentRoomId = roomId;

    // Show navbar
    document.getElementById('navbar').style.display = '';
    this.updateNavbar();

    const template = document.getElementById('room-page');
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(template.content.cloneNode(true));

    // Setup buttons
    document.getElementById('createTeamBtn').addEventListener('click', () => {
      this.showCreateTeamModal();
    });

    document.getElementById('viewPlayerPoolBtn').addEventListener('click', () => {
      Utils.navigate('pool', roomId);
    });

    document.getElementById('markReadyBtn').addEventListener('click', async () => {
      const resp = await API.readyUp(roomId);
      if (resp.status === 'success') {
        Utils.showSuccess('Marked as ready!');
        await this.loadRoom();
      } else {
        Utils.showError(resp.message || 'Failed to mark ready');
      }
    });

    document.getElementById('startAuctionBtn').addEventListener('click', async () => {
      const resp = await API.startAuction(roomId);
      if (resp.status === 'success') {
        Utils.showSuccess('Auction started!');
        await this.loadRoom();
      } else {
        Utils.showError(resp.message || 'Failed to start auction');
      }
    });

    document.getElementById('enterAuctionBtn').addEventListener('click', () => {
      Utils.navigate('auction', roomId);
    });

    document.getElementById('joinRoomBtn').addEventListener('click', async () => {
      const result = await API.joinRoom(roomId);
      if (result.status === 'success') {
        Utils.showSuccess('Joined room successfully!');
        await this.loadRoom();
      } else {
        Utils.showError(result.message || 'Failed to join room');
      }
    });

    document.getElementById('leaveRoomBtn').addEventListener('click', async () => {
      const result = await API.leaveRoom(roomId);
      if (result.status === 'success') {
        Utils.showSuccess('Left room successfully!');
        await this.loadRoom();
      } else {
        Utils.showError(result.message || 'Failed to leave room');
      }
    });

    // Load room data
    await this.loadRoom();

    // Setup Socket.io listeners for real-time updates
    const token = localStorage.getItem('token');
    SocketService.connect(token);
    SocketService.joinRoom(roomId);

    SocketService.on('participant-ready', (data) => {
      this.onParticipantReady(data);
    });

    SocketService.on('all-participants-ready', (data) => {
      this.onAllParticipantsReady(data);
    });
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

  static async loadRoom() {
    const result = await API.getRoom(this.currentRoomId);

    if (result.status === 'success') {
      this.currentRoom = result.data;
      this.renderRoomDetails();
      await this.loadTeams();
    } else {
      Utils.showError(result.message || 'Failed to load room');
    }
  }

  static renderRoomDetails() {
    const room = this.currentRoom;
    const user = Utils.getUser();
    const isParticipant = room.participants?.includes(user.userId);

    document.getElementById('roomTitle').textContent = room.name;
    document.getElementById('roomDesc').textContent = room.description || 'No description';
    document.getElementById('roomBudgetInfo').textContent = room.budgetPerTeam;
    document.getElementById('roomPlayersInfo').textContent = room.maxPlayersPerTeam;
    document.getElementById('roomTeamsCount').textContent = room.teams?.length || 0;

    // Show/hide join/leave buttons
    const auctionStatus = room.auctionStatus || room.status;
    const auctionLive = auctionStatus === 'AUCTION_LIVE' || auctionStatus === 'BIDDING_OPEN' || auctionStatus === 'PLAYER_NOMINATED';
    const auctionWaiting = auctionStatus === 'WAITING_FOR_PARTICIPANTS';
    const alreadyReady = room.readyParticipants && room.readyParticipants.includes(user.userId);
    const isCreator = room.createdBy === user.userId;

    if (isParticipant) {
      document.getElementById('joinRoomBtn').style.display = 'none';
      document.getElementById('leaveRoomBtn').style.display = 'inline-block';
      document.getElementById('createTeamBtn').style.display = 'inline-block';
      document.getElementById('viewPlayerPoolBtn').style.display = 'inline-block';
      document.getElementById('markReadyBtn').style.display = (auctionWaiting && !alreadyReady) ? 'inline-block' : 'none';
      document.getElementById('startAuctionBtn').style.display = (auctionWaiting && isCreator) ? 'inline-block' : 'none';
      document.getElementById('enterAuctionBtn').style.display = (auctionLive || auctionWaiting) ? 'inline-block' : 'none';
    } else {
      document.getElementById('joinRoomBtn').style.display = 'inline-block';
      document.getElementById('leaveRoomBtn').style.display = 'none';
      document.getElementById('createTeamBtn').style.display = 'none';
      document.getElementById('viewPlayerPoolBtn').style.display = 'none';
      document.getElementById('markReadyBtn').style.display = 'none';
      document.getElementById('startAuctionBtn').style.display = 'none';
      document.getElementById('enterAuctionBtn').style.display = 'none';
    }

    // Show invite code box (visible to participants / creator)
    const inviteCodeBox = document.getElementById('inviteCodeBox');
    if (room.inviteCode && isParticipant) {
      document.getElementById('inviteCodeValue').textContent = room.inviteCode;
      inviteCodeBox.style.display = 'flex';
      const copyBtn = document.getElementById('copyInviteCodeBtn');
      copyBtn.onclick = async () => {
        let copied = false;

        if (navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(room.inviteCode);
            copied = true;
          } catch (_) {
            copied = false;
          }
        }

        if (!copied) {
          const tempInput = document.createElement('input');
          tempInput.value = room.inviteCode;
          tempInput.setAttribute('readonly', 'readonly');
          tempInput.style.position = 'absolute';
          tempInput.style.left = '-9999px';
          document.body.appendChild(tempInput);
          tempInput.select();
          tempInput.setSelectionRange(0, tempInput.value.length);

          try {
            copied = document.execCommand('copy');
          } catch (_) {
            copied = false;
          }

          tempInput.remove();
        }

        if (copied) {
          copyBtn.textContent = '✅ Copied!';
          Utils.showSuccess('Invite code copied');
          setTimeout(() => { copyBtn.innerHTML = '&#128203; Copy'; }, 2000);
        } else {
          Utils.showError('Failed to copy invite code');
        }
      };
    } else {
      inviteCodeBox.style.display = 'none';
    }

    // Render participants with ready indicators
    const participantsList = document.getElementById('participantsList');
    participantsList.innerHTML = '';
    const readyParticipants = room.readyParticipants || [];

    if (room.participantNames && room.participants) {
      // Use participantNames for display, participants for ID checking
      room.participants.forEach((participantId, idx) => {
        const participantName = room.participantNames[idx] || participantId;
        const isReady = readyParticipants.includes(participantId);
        const isCurrentUser = participantId === user.userId;

        const li = document.createElement('li');
        li.className = 'participant-item';
        const readyBadge = isReady ? '✅' : '⭕';
        const label = isCurrentUser ? ` (You)` : '';
        li.innerHTML = `<span class="ready-indicator ${isReady ? 'ready' : 'not-ready'}">${readyBadge}</span><span class="participant-name">${participantName}${label}</span>`;
        participantsList.appendChild(li);
      });
    }
  }

  static async loadTeams() {
    const result = await API.getTeams(this.currentRoomId);

    if (result.status === 'success') {
      this.currentTeams = result.data || [];
      this.renderTeams();
    } else {
      Utils.showError(result.message || 'Failed to load teams');
    }
  }

  static renderTeams() {
    const teamsGrid = document.getElementById('teamsGrid');
    const noTeams = document.getElementById('noTeams');

    teamsGrid.innerHTML = '';

    if (this.currentTeams.length === 0) {
      noTeams.style.display = 'block';
      return;
    }

    noTeams.style.display = 'none';

    this.currentTeams.forEach(team => {
      const card = this.createTeamCard(team);
      teamsGrid.appendChild(card);
    });
  }

  static createTeamCard(team) {
    const card = document.createElement('div');
    card.className = 'team-card';

    card.innerHTML = `
      <div class="team-card-header">
        <h4>${team.teamName}</h4>
      </div>
      <div class="team-card-body">
        <div class="team-stat">
          <label>Points</label>
          <strong>${team.totalPoints || 0}</strong>
        </div>
        <div class="team-stat">
          <label>Players</label>
          <strong>${team.players?.length || 0}</strong>
        </div>
        <div class="team-stat">
          <label>Budget</label>
          <strong>${team.budgetSpent || 0} / ${team.budgetAllocated || 0}</strong>
        </div>
      </div>
      <button class="btn-secondary btn-block team-card-btn" data-team-id="${team._id}">
        View Team →
      </button>
    `;

    card.querySelector('.team-card-btn').addEventListener('click', () => {
      Utils.navigate('team', this.currentRoomId, team._id);
    });

    card.addEventListener('click', (e) => {
      if (!e.target.closest('.team-card-btn')) {
        Utils.navigate('team', this.currentRoomId, team._id);
      }
    });

    return card;
  }

  static showCreateTeamModal() {
    const modalTemplate = document.getElementById('create-team-modal');
    const modal = modalTemplate.content.cloneNode(true);

    document.body.appendChild(modal);

    const closeBtn = document.getElementById('closeTeamModal');
    const overlay = document.getElementById('teamModal');

    closeBtn?.addEventListener('click', () => {
      overlay?.remove();
    });

    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    const form = document.getElementById('createTeamForm');
    form?.setAttribute('novalidate', 'novalidate');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const teamName = document.getElementById('teamName').value.trim();
      const budgetAllocated = parseInt(document.getElementById('teamBudget').value);
      const maxBudget = this.currentRoom?.budgetPerTeam || Infinity;

      const errorDiv = document.getElementById('teamError');

      // Client-side budget validation
      if (budgetAllocated > maxBudget) {
        if (errorDiv) {
          errorDiv.textContent = `Budget cannot exceed room limit of ${maxBudget}`;
          errorDiv.style.display = 'block';
        }
        return;
      }

      const teamData = {
        teamName,
        budgetAllocated
      };

      const result = await API.createTeam(this.currentRoomId, teamData);

      if (result.status === 'success') {
        Utils.showSuccess('Team created successfully!');
        overlay?.remove();
        await this.loadRoom();
      } else {
        if (errorDiv) {
          errorDiv.textContent = result.message || 'Failed to create team';
          errorDiv.style.display = 'block';
        }
      }
    });
  }

  static onParticipantReady(data) {
    // Update participant list in real-time without full page reload
    if (this.currentRoom) {
      this.currentRoom.readyParticipants = data.readyParticipants || [];
      this.renderRoomDetails();
    }
  }

  static onAllParticipantsReady(data) {
    // Show starting banner and navigate to auction after delay
    const banner = document.createElement('div');
    banner.className = 'auction-starting-banner';
    banner.innerHTML = `
      <div class="banner-content">
        <div class="banner-icon">🚀</div>
        <h2>Auction is starting...</h2>
        <p>Get ready!</p>
      </div>
    `;
    document.body.appendChild(banner);

    setTimeout(() => {
      Utils.navigate('auction', this.currentRoomId);
    }, 2000);
  }
}
