/**
 * Main App Router and Controller
 */

class App {
  static init() {
    // Check if user is logged in
    if (!Utils.isLoggedIn() && !window.location.hash.includes('auth')) {
      window.location.hash = '#auth';
    }

    // Initialize notification service
    NotificationService.init();

    // Listen for hash changes
    window.addEventListener('hashchange', () => this.route());

    // Initial route
    this.route();
  }

  static route() {
    const { page, id, subId } = Utils.parseHash();

    // Check authentication
    if (page !== 'auth' && !Utils.isLoggedIn()) {
      window.location.hash = '#auth';
      return;
    }

    // Route to appropriate page
    switch (page) {
      case 'auth':
        AuthPage.init();
        break;
      case 'dashboard':
        DashboardPage.init();
        break;
      case 'room':
        if (id) {
          RoomPage.init(id);
        } else {
          window.location.hash = '#dashboard';
        }
        break;
      case 'team':
        if (id && subId) {
          TeamPage.init(id, subId);
        } else if (id) {
          TeamPage.init(null, id);
        } else {
          window.location.hash = '#dashboard';
        }
        break;
      case 'leaderboard':
        if (id) {
          LeaderboardPage.init(id);
        } else {
          window.location.hash = '#dashboard';
        }
        break;
      case 'pool':
        if (id) {
          PlayerPoolPage.init(id);
        } else {
          window.location.hash = '#dashboard';
        }
        break;
      case 'auction':
        if (id) {
          AuctionLivePage.init(id);
        } else {
          window.location.hash = '#dashboard';
        }
        break;
      default:
        if (Utils.isLoggedIn()) {
          window.location.hash = '#dashboard';
        } else {
          window.location.hash = '#auth';
        }
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
