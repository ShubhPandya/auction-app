/**
 * Dashboard Page - List all auction rooms
 */

class DashboardPage {
  static currentRooms = [];

  static async init() {
    // Show navbar
    document.getElementById('navbar').style.display = '';
    this.updateNavbar();

    const template = document.getElementById('dashboard-page');
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(template.content.cloneNode(true));

    // Setup create room button
    document.getElementById('createRoomBtn').addEventListener('click', () => {
      this.showCreateRoomModal();
    });

    // Setup join by code button
    document.getElementById('joinByCodeBtn')?.addEventListener('click', () => {
      this.showJoinByCodeModal();
    });

    // Load rooms
    await this.loadRooms();
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

  static async loadRooms() {
    const result = await API.getRooms();

    if (result.status === 'success' && result.data) {
      this.currentRooms = result.data;
      this.renderRooms();
    } else {
      Utils.showError(result.message || 'Failed to load rooms');
    }
  }

  static renderRooms() {
    const roomsGrid = document.getElementById('roomsGrid');
    const noRooms = document.getElementById('noRooms');

    roomsGrid.innerHTML = '';

    if (this.currentRooms.length === 0) {
      roomsGrid.style.display = 'none';
      noRooms.style.display = 'block';
      return;
    }

    roomsGrid.style.display = '';
    noRooms.style.display = 'none';

    this.currentRooms.forEach(room => {
      const card = this.createRoomCard(room);
      roomsGrid.appendChild(card);
    });
  }

  static createRoomCard(room) {
    const card = document.createElement('div');
    card.className = 'room-card';

    const startDate = Utils.formatDate(room.startDate);
    const endDate = Utils.formatDate(room.endDate);

    card.innerHTML = `
      <div class="room-card-header">
        <h3>${room.name}</h3>
        <span class="room-status ${room.status}">${room.status.toUpperCase()}</span>
      </div>
      <div class="room-card-body">
        <p class="room-desc">${room.description || 'No description'}</p>
        <div class="room-card-stats">
          <div class="stat">
            <label>Budget</label>
            <span>${room.budgetPerTeam}</span>
          </div>
          <div class="stat">
            <label>Max Players</label>
            <span>${room.maxPlayersPerTeam}</span>
          </div>
          <div class="stat">
            <label>Teams</label>
            <span>${room.teams?.length || 0}</span>
          </div>
          <div class="stat">
            <label>Members</label>
            <span>${room.participants?.length || 0}</span>
          </div>
        </div>
        <div class="room-card-dates">
          <small>📅 ${startDate} to ${endDate}</small>
        </div>
      </div>
      <button class="btn-primary btn-block room-card-btn" data-room-id="${room._id}">
        View Room →
      </button>
    `;

    card.querySelector('.room-card-btn').addEventListener('click', () => {
      Utils.navigate('room', room._id);
    });

    return card;
  }

  static showCreateRoomModal() {
    const modalTemplate = document.getElementById('create-room-modal');
    const modal = modalTemplate.content.cloneNode(true);

    document.body.appendChild(modal);

    const closeBtn = document.getElementById('closeRoomModal');
    const overlay = document.getElementById('roomModal');

    closeBtn?.addEventListener('click', () => {
      overlay?.remove();
    });

    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);
    const endDateStr = endDate.toISOString().split('T')[0];

    document.getElementById('roomStart').value = today;
    document.getElementById('roomEnd').value = endDateStr;

    // Setup form submission
    const form = document.getElementById('createRoomForm');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const roomData = {
        name: document.getElementById('roomName').value,
        description: document.getElementById('roomDesc').value,
        budgetPerTeam: parseInt(document.getElementById('roomBudget').value),
        maxPlayersPerTeam: parseInt(document.getElementById('roomPlayers').value),
        startDate: document.getElementById('roomStart').value,
        endDate: document.getElementById('roomEnd').value,
        auctionConfig: {
          bidIncrement: parseFloat(document.getElementById('bidIncrement').value) || 0.25,
          bidTimerSeconds: parseInt(document.getElementById('bidTimer').value) || 30,
          nominationOrder: document.getElementById('nominationOrder').value,
          unsoldRule: document.getElementById('unsoldRule').value,
          roleComposition: {
            minBatsmen: parseInt(document.getElementById('minBatsmen').value) || 3,
            maxBatsmen: parseInt(document.getElementById('maxBatsmen').value) || 6,
            minBowlers: parseInt(document.getElementById('minBowlers').value) || 3,
            maxBowlers: parseInt(document.getElementById('maxBowlers').value) || 6,
            minAllRounders: parseInt(document.getElementById('minAllRounders').value) || 1,
            maxAllRounders: parseInt(document.getElementById('maxAllRounders').value) || 4,
            minWK: parseInt(document.getElementById('minWK').value) || 1,
            maxWK: parseInt(document.getElementById('maxWK').value) || 2
          }
        }
      };

      const errorDiv = document.getElementById('roomError');
      const showError = (msg) => {
        if (errorDiv) {
          errorDiv.textContent = msg;
          errorDiv.style.display = 'block';
        }
      };

      // Client-side validation: end date must be after start date
      if (roomData.endDate <= roomData.startDate) {
        showError('End date must be after start date.');
        return;
      }

      // Client-side validation: role composition min <= max
      const rc = roomData.auctionConfig.roleComposition;
      if (rc.minBatsmen > rc.maxBatsmen) { showError('Batsmen: min cannot exceed max.'); return; }
      if (rc.minBowlers > rc.maxBowlers) { showError('Bowlers: min cannot exceed max.'); return; }
      if (rc.minAllRounders > rc.maxAllRounders) { showError('All-rounders: min cannot exceed max.'); return; }
      if (rc.minWK > rc.maxWK) { showError('Wicket-keepers: min cannot exceed max.'); return; }

      const result = await API.createRoom(roomData);

      if (result.status === 'success') {
        Utils.showSuccess('Room created successfully!');
        overlay?.remove();
        await this.loadRooms();
        Utils.navigate('room', result.data._id);
      } else {
        showError(result.message || 'Failed to create room');
      }
    });
  }

  static showJoinByCodeModal() {
    // Inline modal for join by invite code
    const existingModal = document.getElementById('joinByCodeModal');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'joinByCodeModal';
    overlay.innerHTML = `
      <div class="modal-content" style="max-width:400px;">
        <div class="modal-header">
          <h2>Join Room by Code</h2>
          <button class="modal-close" id="closeJoinModal">&times;</button>
        </div>
        <div class="modal-form">
          <div class="form-group">
            <label for="inviteCodeInput">Invite Code</label>
            <input type="text" id="inviteCodeInput" placeholder="e.g. AB3K9Z" maxlength="6"
              style="text-transform:uppercase;letter-spacing:0.15em;font-size:1.2rem;text-align:center;">
          </div>
          <button class="btn-primary btn-full" id="submitJoinCode">Join Room</button>
          <div id="joinCodeError" class="error-message" style="display:none;margin-top:10px;"></div>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    document.getElementById('closeJoinModal').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    const input = document.getElementById('inviteCodeInput');
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase();
    });

    document.getElementById('submitJoinCode').addEventListener('click', async () => {
      const code = input.value.trim();
      if (!code || code.length < 4) {
        document.getElementById('joinCodeError').textContent = 'Please enter a valid invite code';
        document.getElementById('joinCodeError').style.display = 'block';
        return;
      }

      const result = await API.joinRoomByCode(code);

      if (result.status === 'success') {
        Utils.showSuccess('Joined room successfully!');
        overlay.remove();
        await this.loadRooms();
        Utils.navigate('room', result.data.roomId);
      } else {
        document.getElementById('joinCodeError').textContent = result.message || 'Invalid invite code';
        document.getElementById('joinCodeError').style.display = 'block';
      }
    });
  }
}
