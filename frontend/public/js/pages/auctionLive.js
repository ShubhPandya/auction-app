/**
 * Live Auction Page
 */

class AuctionLivePage {
  static currentRoomId = null;
  static auctionState = null;
  static timerInterval = null;
  static timerRemaining = 0;
  static myBudget = 0;

  static async init(roomId) {
    this.currentRoomId = roomId;
    this.cleanup();

    document.getElementById('navbar').style.display = '';
    this.updateNavbar();

    const template = document.getElementById('auction-live-page');
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(template.content.cloneNode(true));

    // Connect socket
    const token = localStorage.getItem('token');
    SocketService.connect(token);
    SocketService.joinRoom(roomId);

    this.bindSocketEvents();
    await this.loadInitialState();
  }

  static updateNavbar() {
    const user = Utils.getUser();
    const navUser = document.getElementById('navUser');
    if (navUser) navUser.textContent = `👤 ${user.username}`;
  }

  static cleanup() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    // Remove old socket listeners
    const events = ['player-nominated', 'bid-placed', 'timer-tick', 'player-sold', 'player-unsold', 'auction-complete', 'room-state'];
    events.forEach(evt => SocketService.off && SocketService.off(evt));
  }

  static bindSocketEvents() {
    SocketService.on('player-nominated', (data) => this.onPlayerNominated(data));
    SocketService.on('bid-placed', (data) => this.onBidPlaced(data));
    SocketService.on('timer-tick', (data) => this.onTimerTick(data));
    SocketService.on('player-sold', (data) => this.onPlayerSold(data));
    SocketService.on('player-unsold', (data) => this.onPlayerUnsold(data));
    SocketService.on('auction-complete', (data) => this.onAuctionComplete(data));
    SocketService.on('room-state', (data) => this.onRoomState(data));
  }

  static async loadInitialState() {
    try {
      const resp = await API.getAuctionState(this.currentRoomId);
      if (resp.status === 'success') {
        this.applyState(resp.data);
      } else {
        this.showMessage(resp.message || 'Waiting for auction to start...', 'info');
        this.setWaitingState();
      }
    } catch (e) {
      this.setWaitingState();
    }
  }

  static applyState(state) {
    if (!state) return;
    this.auctionState = state;

    this.renderTeamsSidebar(state.teams || []);
    this.renderMySquad(state.myTeam);

    if (state.currentPlayer) {
      this.renderPlayerCard(state.currentPlayer);
      this.renderBidInfo(state.currentBid, state.highestBidder);
      if (state.timerRemaining !== undefined) {
        this.updateTimer(state.timerRemaining, state.timerDuration || 30);
      }
      this.updateBidButton(state);
    } else if (state.status === 'WAITING_FOR_PARTICIPANTS') {
      this.setWaitingState(state);
    } else if (state.status === 'AUCTION_COMPLETE') {
      this.onAuctionComplete(state);
    }
  }

  static setWaitingState(state) {
    const center = document.getElementById('auction-center');
    if (!center) return;
    const ready = state && state.readyCount !== undefined
      ? `${state.readyCount} / ${state.participantCount} participants ready`
      : 'Waiting for participants to be ready...';
    center.innerHTML = `
      <div class="waiting-state">
        <div class="waiting-icon">⏳</div>
        <h2>Auction Lobby</h2>
        <p class="ready-status">${ready}</p>
        <button class="btn btn-primary" id="markReadyBtn">Mark as Ready</button>
      </div>
    `;
    document.getElementById('markReadyBtn')?.addEventListener('click', () => this.markReady());
  }

  static async markReady() {
    try {
      const resp = await API.readyUp(this.currentRoomId);
      if (resp.status === 'success') {
        const btn = document.getElementById('markReadyBtn');
        if (btn) {
          btn.textContent = '✓ Ready!';
          btn.disabled = true;
          btn.classList.add('btn-success');
        }
        this.showMessage('You are ready! Waiting for others...', 'success');
      }
    } catch (e) {
      this.showMessage('Failed to mark ready', 'error');
    }
  }

  static renderPlayerCard(player) {
    const el = document.getElementById('current-player-card');
    if (!el) return;
    const roleIcon = { BAT: '🏏', BOWL: '🎳', AR: '⚡', WK: '🧤' }[player.role] || '🏏';
    el.innerHTML = `
      <div class="player-card-inner">
        <div class="player-role-badge">${roleIcon} ${player.role}</div>
        <h2 class="player-name">${player.name}</h2>
        <div class="player-meta">
          <span class="ipl-team">${player.iplTeam || ''}</span>
          <span class="separator">•</span>
          <span class="country">${player.country || 'India'}</span>
        </div>
        <div class="base-price">Base: ₹${this.formatPrice(player.basePrice || 0)}</div>
      </div>
    `;
  }

  static renderBidInfo(currentBid, highestBidder) {
    const bidEl = document.getElementById('current-bid-display');
    if (!bidEl) return;
    if (currentBid > 0) {
      bidEl.innerHTML = `
        <div class="bid-amount">₹${this.formatPrice(currentBid)}</div>
        <div class="highest-bidder">Leading: <strong>${highestBidder || '—'}</strong></div>
      `;
    } else {
      bidEl.innerHTML = `<div class="bid-amount no-bids">No bids yet</div>`;
    }
  }

  static updateTimer(remaining, total) {
    this.timerRemaining = remaining;
    const pct = total > 0 ? remaining / total : 0;
    const radius = 54;
    const circ = 2 * Math.PI * radius;
    const offset = circ * (1 - pct);

    const circle = document.getElementById('timer-circle');
    const timerText = document.getElementById('timer-text');
    if (circle) circle.style.strokeDashoffset = offset;
    if (timerText) timerText.textContent = Math.ceil(remaining);

    const ring = document.querySelector('.timer-ring');
    if (ring) {
      ring.classList.toggle('timer-urgent', remaining <= 5);
    }
  }

  static updateBidButton(state) {
    const btn = document.getElementById('bid-btn');
    if (!btn) return;

    const user = Utils.getUser();
    const myBid = state.highestBidder === user.username;
    const nextBid = (state.currentBid || 0) + (state.bidIncrement || 0.25);
    const myTeam = state.myTeam;
    const budget = myTeam ? myTeam.remainingBudget : 0;

    let disabled = false;
    let reason = '';

    if (myBid) {
      disabled = true;
      reason = 'You are the highest bidder';
    } else if (budget < nextBid) {
      disabled = true;
      reason = 'Insufficient budget';
    } else if (myTeam && myTeam.playerCount >= myTeam.maxPlayersPerTeam) {
      disabled = true;
      reason = 'Squad is full';
    }

    btn.disabled = disabled;
    btn.title = reason;
    btn.textContent = disabled && myBid ? '✓ Leading' : `BID ₹${this.formatPrice(nextBid)}`;
  }

  static renderTeamsSidebar(teams) {
    const el = document.getElementById('teams-sidebar-list');
    if (!el) return;
    const user = Utils.getUser();
    if (!teams.length) {
      el.innerHTML = '<p class="no-data">No teams yet</p>';
      return;
    }
    el.innerHTML = teams.map(t => `
      <div class="team-purse-row ${t.ownerUsername === user.username ? 'my-team' : ''}">
        <span class="team-name">${t.name}</span>
        <span class="team-owner">${t.ownerUsername}</span>
        <span class="team-budget">₹${this.formatPrice(t.remainingBudget || 0)}</span>
        <span class="team-players">${t.playerCount || 0} players</span>
      </div>
    `).join('');
  }

  static renderMySquad(myTeam) {
    const el = document.getElementById('my-squad-list');
    if (!el) return;
    if (!myTeam) {
      el.innerHTML = '<p class="no-data">You have no team in this auction</p>';
      return;
    }
    const budgetEl = document.getElementById('my-budget-display');
    if (budgetEl) budgetEl.textContent = `₹${this.formatPrice(myTeam.remainingBudget || 0)} remaining`;

    if (!myTeam.players || !myTeam.players.length) {
      el.innerHTML = '<p class="no-data">No players won yet</p>';
      return;
    }
    el.innerHTML = myTeam.players.map(p => `
      <div class="squad-player-row">
        <span class="squad-role-badge">${p.role}</span>
        <span class="squad-player-name">${p.name}</span>
        <span class="squad-price">₹${this.formatPrice(p.soldPrice || 0)}</span>
      </div>
    `).join('');
  }

  // ---- Socket event handlers ----

  static onPlayerNominated(data) {
    this.renderPlayerCard(data.player);
    this.renderBidInfo(data.basePrice, null);
    this.updateTimer(data.timerSeconds || 30, data.timerSeconds || 30);
    this.updateBidButton({ ...this.auctionState, currentBid: data.basePrice, highestBidder: null });
    this.clearBanner();
    if (this.auctionState) this.auctionState.currentPlayer = data.player;
  }

  static onBidPlaced(data) {
    const user = Utils.getUser();
    const wasLeading = this.auctionState && this.auctionState.highestBidder === user.username;
    this.renderBidInfo(data.amount, data.bidderName);
    if (this.auctionState) {
      this.auctionState.currentBid = data.amount;
      this.auctionState.highestBidder = data.bidderName;
    }
    this.updateBidButton({ ...this.auctionState });
    if (wasLeading && data.bidderName !== user.username) {
      this.showFlash('OUTBID!', 'outbid');
    }
  }

  static onTimerTick(data) {
    const total = (this.auctionState && this.auctionState.timerDuration) || 30;
    this.updateTimer(data.remaining, total);
  }

  static onPlayerSold(data) {
    this.showFlash(`SOLD! ₹${this.formatPrice(data.price)} → ${data.winnerName}`, 'sold');
    if (this.auctionState) {
      this.auctionState.teams = data.teams || this.auctionState.teams;
      this.auctionState.myTeam = data.myTeam || this.auctionState.myTeam;
    }
    this.renderTeamsSidebar(data.teams || []);
    this.renderMySquad(data.myTeam || (this.auctionState && this.auctionState.myTeam));
    this.updateTimer(0, 30);
  }

  static onPlayerUnsold(data) {
    this.showFlash('UNSOLD', 'unsold');
    this.updateTimer(0, 30);
  }

  static onAuctionComplete(data) {
    const center = document.getElementById('auction-center');
    if (!center) return;
    center.innerHTML = `
      <div class="auction-complete">
        <div class="complete-icon">🏆</div>
        <h2>Auction Complete!</h2>
        <p>All players have been auctioned.</p>
        <button class="btn btn-primary" onclick="Utils.navigate('room','${this.currentRoomId}')">Back to Room</button>
      </div>
    `;
  }

  static onRoomState(data) {
    if (data && data.auction) {
      this.applyState(data.auction);
    }
  }

  // ---- UI helpers ----

  static showFlash(message, type) {
    let banner = document.getElementById('auction-banner');
    if (!banner) return;
    banner.textContent = message;
    banner.className = `auction-banner ${type}`;
    banner.style.display = 'flex';
    setTimeout(() => {
      banner.style.display = 'none';
    }, 3000);
  }

  static clearBanner() {
    const banner = document.getElementById('auction-banner');
    if (banner) banner.style.display = 'none';
  }

  static showMessage(msg, type) {
    const el = document.getElementById('auction-message');
    if (!el) return;
    el.textContent = msg;
    el.className = `notification ${type}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  }

  static formatPrice(val) {
    const cr = val / 100;
    if (cr >= 1) return cr.toFixed(1) + ' Cr';
    const lakh = val;
    return lakh + 'L';
  }

  static bindBidButton() {
    const btn = document.getElementById('bid-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const nextBid = ((this.auctionState && this.auctionState.currentBid) || 0) + ((this.auctionState && this.auctionState.bidIncrement) || 0.25);
      SocketService.emit('place-bid', { roomId: this.currentRoomId, amount: nextBid });
      btn.textContent = '⏳ Sending...';
      btn.disabled = true;
      setTimeout(() => {
        if (this.auctionState) this.updateBidButton(this.auctionState);
      }, 2000);
    });
  }

  static bindBackButton() {
    const btn = document.getElementById('auction-back-btn');
    if (!btn) return;
    btn.addEventListener('click', () => Utils.navigate('room', this.currentRoomId));
  }
}

// Bind events after DOM is ready (called after template cloneNode)
const _origAuctionInit = AuctionLivePage.init.bind(AuctionLivePage);
AuctionLivePage.init = async function (roomId) {
  await _origAuctionInit(roomId);
  AuctionLivePage.bindBidButton();
  AuctionLivePage.bindBackButton();
};
