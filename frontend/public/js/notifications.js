/**
 * Notification Service
 * Manages in-app notifications and integrates with Socket.io events
 */

class NotificationService {
  static notifications = [];
  static notificationId = 0;
  static unreadCount = 0;
  static maxNotifications = 50;

  static init() {
    this.setupSocketListeners();
    this.setupUI();
  }

  static setupUI() {
    // Ensure bell icon exists
    const bellIcon = document.getElementById('notificationBell');
    const badge = document.getElementById('notificationBadge');

    if (bellIcon) {
      bellIcon.addEventListener('click', () => this.toggleNotificationPanel());
    }

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('notificationPanel');
      if (panel && !e.target.closest('#notificationBell') && !e.target.closest('#notificationPanel')) {
        panel.style.display = 'none';
      }
    });
  }

  static setupSocketListeners() {
    // Listen to outbid events
    SocketService.on('bid-placed', (data) => {
      if (data.isOutbid) {
        this.add('outbid', `You were outbid! New price: ₹${data.newPrice} Cr`);
      }
    });

    // Listen to score updates
    SocketService.on('leaderboard-updated', (data) => {
      this.add('score-update', 'Leaderboard updated with new scores');
    });

    // Listen to auction starting
    SocketService.on('all-participants-ready', (data) => {
      this.add('auction-starting', 'Auction is starting soon!');
    });

    // Listen to player sold
    SocketService.on('player-sold', (data) => {
      if (data.winnerTeamId && data.currentUserId === data.winnerTeamId) {
        this.add('player-sold', `🎉 You won ${data.playerName} for ₹${data.price} Cr!`);
      } else {
        this.add('player-sold', `${data.playerName} sold to ${data.winnerTeamName} for ₹${data.price} Cr`);
      }
    });

    // Listen to player unsold
    SocketService.on('player-unsold', (data) => {
      this.add('player-unsold', `${data.playerName} went unsold`);
    });

    // Listen to auction complete
    SocketService.on('auction-complete', (data) => {
      this.add('auction-complete', '🏆 Auction Complete! Check the leaderboard for final standings');
    });

    // Listen to participant joined
    SocketService.on('participant-joined', (data) => {
      this.add('participant-joined', `${data.participantName} joined the room`);
    });
  }

  static add(type, message) {
    const id = ++this.notificationId;
    const timestamp = new Date();

    const notification = {
      id,
      type,
      message,
      timestamp,
      read: false
    };

    this.notifications.unshift(notification);
    this.unreadCount++;

    // Keep only max notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    this.updateBadge();
    this.updateNotificationPanel();

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.markRead(id);
    }, 5000);

    // Show toast
    this.showToast(message, type);
  }

  static markRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.updateBadge();
      this.updateNotificationPanel();
    }
  }

  static markAllRead() {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
    this.updateBadge();
    this.updateNotificationPanel();
  }

  static getUnread() {
    return this.notifications.filter(n => !n.read);
  }

  static getAll() {
    return this.notifications;
  }

  static updateBadge() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
      badge.textContent = this.unreadCount;
      badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
    }
  }

  static toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      if (panel.style.display === 'block') {
        this.updateNotificationPanel();
      }
    }
  }

  static updateNotificationPanel() {
    const list = document.getElementById('notificationList');
    if (!list) return;

    list.innerHTML = '';

    if (this.notifications.length === 0) {
      list.innerHTML = '<div class="no-notifications">No notifications yet</div>';
      return;
    }

    this.notifications.forEach(notif => {
      const item = document.createElement('div');
      item.className = `notification-item ${notif.type} ${notif.read ? 'read' : 'unread'}`;

      const icon = this.getNotificationIcon(notif.type);
      const timeAgo = this.getTimeAgo(notif.timestamp);

      item.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
          <p class="notification-message">${notif.message}</p>
          <p class="notification-time">${timeAgo}</p>
        </div>
        <button class="notification-dismiss" data-id="${notif.id}">×</button>
      `;

      item.querySelector('.notification-dismiss').addEventListener('click', () => {
        this.remove(notif.id);
      });

      list.appendChild(item);
    });
  }

  static remove(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.unreadCount = this.notifications.filter(n => !n.read).length;
    this.updateBadge();
    this.updateNotificationPanel();
  }

  static getNotificationIcon(type) {
    const icons = {
      'outbid': '📉',
      'score-update': '📊',
      'auction-starting': '🚀',
      'player-sold': '✅',
      'player-unsold': '❌',
      'auction-complete': '🏆',
      'participant-joined': '👤'
    };
    return icons[type] || '📬';
  }

  static getTimeAgo(timestamp) {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return timestamp.toLocaleDateString();
  }

  static showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--primary-color);
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease-out;
      z-index: 9999;
      max-width: 300px;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}
