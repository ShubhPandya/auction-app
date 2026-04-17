/**
 * Team Details Page
 */

class TeamPage {
  static currentRoomId = null;
  static currentTeamId = null;
  static currentTeam = null;

  static async init(roomId, teamId) {
    this.currentRoomId = roomId;
    this.currentTeamId = teamId;

    // Show navbar
    document.getElementById('navbar').style.display = '';
    this.updateNavbar();

    const template = document.getElementById('team-page');
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(template.content.cloneNode(true));

    // Setup buttons
    document.getElementById('addPlayerBtn').addEventListener('click', () => {
      this.showAddPlayerModal();
    });

    document.getElementById('exportTeamBtn').addEventListener('click', () => {
      this.showExportModal();
    });

    // Load team data
    await this.loadTeam();
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

  static async loadTeam() {
    if (!this.currentRoomId || !this.currentTeamId) {
      const addPlayerBtn = document.getElementById('addPlayerBtn');
      if (addPlayerBtn) {
        addPlayerBtn.style.display = 'none';
      }
      Utils.showError('Invalid team link');
      return;
    }

    const result = await API.getTeamStats(this.currentRoomId, this.currentTeamId);

    if (result.status === 'success') {
      this.currentTeam = result.data;
      this.renderTeamDetails();
    } else {
      Utils.showError(result.message || 'Failed to load team');
    }
  }

  static renderTeamDetails() {
    const team = this.currentTeam;

    document.getElementById('teamTitle').textContent = team.teamName;
    document.getElementById('teamPoints').textContent = team.totalPoints || 0;
    document.getElementById('budgetUsed').textContent = `${team.budgetSpent || 0} / ${team.budgetAllocated || 0}`;
    document.getElementById('playerCount').textContent = `${team.players?.length || 0} / ${team.maxPlayersPerTeam || 11}`;

    this.renderTabButtons();
    this.renderPlayers();
  }

  static renderTabButtons() {
    const tabContainer = document.getElementById('teamTabs');
    if (!tabContainer) {
      return; // No tab container yet, create it
    }

    tabContainer.innerHTML = '';

    const squadTab = document.createElement('button');
    squadTab.className = 'tab-btn active';
    squadTab.textContent = '👥 Squad';
    squadTab.addEventListener('click', () => this.switchTab('squad'));

    const breakdownTab = document.createElement('button');
    breakdownTab.className = 'tab-btn';
    breakdownTab.textContent = '📊 Match Breakdown';
    breakdownTab.addEventListener('click', () => this.switchTab('breakdown'));

    tabContainer.appendChild(squadTab);
    tabContainer.appendChild(breakdownTab);
  }

  static async switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update content
    if (tabName === 'squad') {
      this.renderPlayers();
    } else if (tabName === 'breakdown') {
      await this.renderMatchBreakdown();
    }
  }

  static async renderMatchBreakdown() {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '<p style="padding: 20px; text-align: center;">Loading match breakdown...</p>';

    const result = await API.getTeamBreakdown(this.currentRoomId, this.currentTeamId);

    if (result.status === 'success') {
      const breakdown = result.data;

      if (!breakdown || breakdown.length === 0) {
        playersList.innerHTML = '<p style="padding: 20px; text-align: center;">No match data available yet</p>';
        return;
      }

      playersList.innerHTML = '';

      // Create breakdown table
      const table = document.createElement('table');
      table.className = 'breakdown-table';

      // Get all unique player names
      const playerNames = new Set();
      breakdown.forEach(match => {
        Object.keys(match.players).forEach(name => playerNames.add(name));
      });
      const playerArray = Array.from(playerNames).sort();

      // Header row
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      const matchHeader = document.createElement('th');
      matchHeader.textContent = 'Match';
      headerRow.appendChild(matchHeader);

      playerArray.forEach(player => {
        const th = document.createElement('th');
        th.textContent = player.split(' ')[0]; // Show first name only
        th.title = player;
        headerRow.appendChild(th);
      });

      const totalHeader = document.createElement('th');
      totalHeader.textContent = 'Total';
      headerRow.appendChild(totalHeader);

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Body rows
      const tbody = document.createElement('tbody');
      breakdown.forEach(match => {
        const row = document.createElement('tr');
        const matchCell = document.createElement('td');
        matchCell.className = 'match-name';
        matchCell.textContent = match.matchId;
        row.appendChild(matchCell);

        let matchTotal = 0;
        playerArray.forEach(player => {
          const cell = document.createElement('td');
          const points = match.players[player]?.total || 0;
          cell.textContent = points > 0 ? points : '-';
          cell.className = 'points-cell';
          if (points > 0) {
            cell.classList.add('has-points');
          }
          row.appendChild(cell);
          matchTotal += points;
        });

        const totalCell = document.createElement('td');
        totalCell.className = 'total-cell';
        totalCell.textContent = matchTotal;
        row.appendChild(totalCell);

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      playersList.appendChild(table);
    } else {
      playersList.innerHTML = `<p style="padding: 20px; text-align: center; color: red;">Failed to load breakdown: ${result.message}</p>`;
    }
  }

  static renderPlayers() {
    const playersList = document.getElementById('playersList');
    const noPlayers = document.getElementById('noPlayers');

    playersList.innerHTML = '';

    if (!this.currentTeam.players || this.currentTeam.players.length === 0) {
      noPlayers.style.display = 'block';
      return;
    }

    noPlayers.style.display = 'none';

    this.currentTeam.players.forEach(player => {
      const card = this.createPlayerCard(player);
      playersList.appendChild(card);
    });
  }

  static createPlayerCard(player) {
    const card = document.createElement('div');
    card.className = 'player-card';

    card.innerHTML = `
      <div class="player-header">
        <h4>${player.playerName}</h4>
        <button class="btn-remove" data-player-id="${player._id}">✕</button>
      </div>
      <div class="player-info">
        <div class="info-row">
          <label>Team</label>
          <span>${player.iplTeam}</span>
        </div>
        <div class="info-row">
          <label>Role</label>
          <span>${player.role}</span>
        </div>
        <div class="info-row">
          <label>Points</label>
          <strong>${player.points || 0}</strong>
        </div>
      </div>
    `;

    card.querySelector('.btn-remove').addEventListener('click', async () => {
      if (confirm(`Remove ${player.playerName} from team?`)) {
        const result = await API.removePlayerFromTeam(
          this.currentRoomId,
          this.currentTeamId,
          player._id
        );

        if (result.status === 'success') {
          Utils.showSuccess('Player removed successfully!');
          await this.loadTeam();
        } else {
          Utils.showError(result.message || 'Failed to remove player');
        }
      }
    });

    return card;
  }

  static showAddPlayerModal() {
    const modalTemplate = document.getElementById('add-player-modal');
    const modal = modalTemplate.content.cloneNode(true);

    document.body.appendChild(modal);

    const closeBtn = document.getElementById('closePlayerModal');
    const overlay = document.getElementById('playerModal');

    closeBtn?.addEventListener('click', () => {
      overlay?.remove();
    });

    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    // Populate popular players list — use modal-scoped query to avoid ID conflict with #playersList on team page
    const modalPlayersSearchList = overlay ? overlay.querySelector('.players-search-list') : null;
    const popularPlayers = Utils.getPopularPlayers();
    if (modalPlayersSearchList) {
      modalPlayersSearchList.innerHTML = '';

      popularPlayers.forEach(p => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'player-quick-select';
        btn.textContent = `${p.name} (${p.team})`;

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('playerName').value = p.name;
          document.getElementById('playerTeam').value = p.team;
          document.getElementById('playerRole').value = p.role;
        });

        modalPlayersSearchList.appendChild(btn);
      });
    }

    // Setup form submission
    const form = document.getElementById('addPlayerForm');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check if team is full
      if ((this.currentTeam.players?.length || 0) >= this.currentTeam.maxPlayersPerTeam) {
        const errorDiv = document.getElementById('playerError');
        if (errorDiv) {
          errorDiv.textContent = 'Team is full! Cannot add more players.';
          errorDiv.style.display = 'block';
        }
        return;
      }

      const playerData = {
        playerId: document.getElementById('playerName').value.toLowerCase().replace(/\s+/g, '_'),
        playerName: document.getElementById('playerName').value,
        iplTeam: document.getElementById('playerTeam').value,
        role: document.getElementById('playerRole').value
      };

      const result = await API.addPlayerToTeam(
        this.currentRoomId,
        this.currentTeamId,
        playerData
      );

      if (result.status === 'success') {
        Utils.showSuccess('Player added successfully!');
        overlay?.remove();
        await this.loadTeam();
      } else {
        const errorDiv = document.getElementById('playerError');
        if (errorDiv) {
          errorDiv.textContent = result.message || 'Failed to add player';
          errorDiv.style.display = 'block';
        }
      }
    });
  }

  static async showExportModal() {
    const result = await API.getTeamExport(this.currentRoomId, this.currentTeamId);

    if (result.status !== 'success') {
      Utils.showError(result.message || 'Failed to load export data');
      return;
    }

    const data = result.data;
    const modalTemplate = document.getElementById('team-export-modal');
    const modal = modalTemplate.content.cloneNode(true);

    document.body.appendChild(modal);

    const exportContent = document.getElementById('exportContent');
    if (exportContent) {
      exportContent.innerHTML = `
        <div class="export-summary">
          <div class="summary-row">
            <label>Team Name</label>
            <strong>${data.teamName}</strong>
          </div>
          <div class="summary-row">
            <label>Owner</label>
            <strong>${data.ownerName}</strong>
          </div>
          <div class="summary-row">
            <label>Room</label>
            <strong>${data.roomName}</strong>
          </div>
          <div class="summary-row">
            <label>Total Points</label>
            <strong>${data.totalPoints}</strong>
          </div>
          <div class="summary-row">
            <label>Budget</label>
            <strong>₹${data.budgetSpent} Cr / ₹${data.totalBudgetAllocated} Cr (Remaining: ₹${data.budgetRemaining} Cr)</strong>
          </div>
        </div>

        <h3 class="export-table-title">Squad Composition</h3>
        <table class="export-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Role</th>
              <th>IPL Team</th>
              <th>Base Price</th>
              <th>Purchase Price</th>
              <th>Current Points</th>
            </tr>
          </thead>
          <tbody>
            ${data.players.map(p => `
              <tr>
                <td>${p.playerName}</td>
                <td>${p.role}</td>
                <td>${p.iplTeam}</td>
                <td>₹${p.basePrice} Cr</td>
                <td>₹${p.purchasePrice} Cr</td>
                <td>${p.currentPoints}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    const closeBtn = document.getElementById('closeExportModal');
    const overlay = document.getElementById('exportModal');

    closeBtn?.addEventListener('click', () => {
      overlay?.remove();
    });

    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    const printBtn = document.getElementById('printExportBtn');
    printBtn?.addEventListener('click', () => {
      window.print();
    });

    const copyBtn = document.getElementById('copyLinkBtn');
    copyBtn?.addEventListener('click', async () => {
      const link = `http://localhost:8000/#team/${this.currentRoomId}/${this.currentTeamId}`;
      let copied = false;

      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(link);
          copied = true;
        } catch (_) {
          copied = false;
        }
      }

      if (!copied) {
        const tempInput = document.createElement('input');
        tempInput.value = link;
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
        Utils.showSuccess('Link copied to clipboard');
        setTimeout(() => { copyBtn.innerHTML = '🔗 Copy Link'; }, 2000);
      } else {
        Utils.showError('Failed to copy link');
      }
    });

    const closeExportBtn = document.getElementById('closeExportBtn');
    closeExportBtn?.addEventListener('click', () => {
      overlay?.remove();
    });
  }
}
