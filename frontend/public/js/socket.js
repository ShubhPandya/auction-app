/**
 * Socket Service - frontend singleton wrapper
 */

class SocketServiceClass {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.handlers = new Map();
  }

  connect(token) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });

    // Re-subscribe handlers on fresh socket instance.
    this.handlers.forEach((callbacks, event) => {
      callbacks.forEach((callback) => this.socket.on(event, callback));
    });

    this.socket.on('connect', () => {
      if (this.roomId && token) {
        this.joinRoom(this.roomId);
      }
    });

    return this.socket;
  }

  joinRoom(roomId) {
    if (!this.socket) {
      return;
    }

    const token = localStorage.getItem('token');
    this.roomId = roomId;
    this.socket.emit('join-auction-room', { roomId, token });
  }

  leaveRoom(roomId) {
    if (!this.socket) {
      return;
    }

    this.socket.emit('leave-auction-room', { roomId });
    if (this.roomId === roomId) {
      this.roomId = null;
    }
  }

  on(event, callback) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }

    this.handlers.get(event).push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  emit(event, data) {
    if (!this.socket) {
      return;
    }

    this.socket.emit(event, data);
  }

  disconnect() {
    if (!this.socket) {
      return;
    }

    this.socket.disconnect();
    this.socket = null;
    this.roomId = null;
  }

  isConnected() {
    return !!this.socket?.connected;
  }
}

const SocketService = new SocketServiceClass();
window.SocketService = SocketService;
