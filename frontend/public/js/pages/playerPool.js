/**
 * Player Pool Page
 */

class PlayerPoolPage {
  static currentRoomId = null;
  static currentPlayers = [];

  static async init(roomId) {
    this.currentRoomId = roomId;

    // Show navbar
    document.getElementById('navbar').style.display = '';
    this.updateNavbar();

    const template = document.getElementById('player-pool-page');
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(template.content.cloneNode(true));

    this.bindEvents();
    await this.loadPlayers();
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

  static bindEvents() {
    const onFilterChange = () => this.loadPlayers();

    document.getElementById('poolRoleFilter')?.addEventListener('change', onFilterChange);
    document.getElementById('poolTeamFilter')?.addEventListener('change', onFilterChange);
    document.getElementById('poolStatusFilter')?.addEventListener('change', onFilterChange);

    const searchInput = document.getElementById('poolSearch');
    let searchTimer = null;
    searchInput?.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => this.loadPlayers(), 250);
    });

    document.getElementById('backToRoomFromPool')?.addEventListener('click', (e) => {
      e.preventDefault();
      Utils.navigate('room', this.currentRoomId);
    });
  }

  static async loadPlayers() {
    const filters = {
      role: document.getElementById('poolRoleFilter')?.value || 'all',
      iplTeam: document.getElementById('poolTeamFilter')?.value || 'all',
      status: document.getElementById('poolStatusFilter')?.value || 'all',
      search: document.getElementById('poolSearch')?.value?.trim() || ''
    };

    const result = await API.getPlayerPool(this.currentRoomId, filters);

    if (result.status === 'success') {
      this.currentPlayers = result.data || [];
      this.renderPlayers();
    } else {
      Utils.showError(result.message || 'Failed to load player pool');
    }
  }

  static renderPlayers() {
    const grid = document.getElementById('playerPoolGrid');
    const empty = document.getElementById('poolEmptyState');
    const count = document.getElementById('poolCount');

    if (!grid || !empty || !count) return;

    grid.innerHTML = '';
    count.textContent = `${this.currentPlayers.length} players`;

    if (this.currentPlayers.length === 0) {
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';

    this.currentPlayers.forEach((player) => {
      const card = document.createElement('div');
      card.className = 'player-pool-card';

      const statusClass = `status-${player.auctionStatus || 'available'}`;
      const statusLabel = (player.auctionStatus || 'available').toUpperCase();

      let soldMeta = '';
      if (player.auctionStatus === 'sold') {
        const team = player.soldToTeamName || 'Unknown Team';
        const price = typeof player.soldPrice === 'number' ? `${player.soldPrice} Cr` : 'N/A';
        soldMeta = `<p class="sold-meta">Sold to ${team} @ ₹${price}</p>`;
      }

      card.innerHTML = `
        <div class="player-pool-card-header">
          <h3>${player.playerName}</h3>
          <span class="pool-status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <div class="player-pool-card-body">
          <p><strong>Role:</strong> ${player.role || 'N/A'}</p>
          <p><strong>IPL Team:</strong> ${player.iplTeam || 'N/A'}</p>
          <p><strong>Country:</strong> ${player.country || 'N/A'}</p>
          <p><strong>Base Price:</strong> ₹${player.basePrice || 0} Cr</p>
          ${soldMeta}
        </div>
      `;

      grid.appendChild(card);
    });
  }
}
