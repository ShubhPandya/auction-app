/**
 * Socket Service - room channel helpers
 */

let ioInstance = null;

function roomChannel(roomId) {
  return `auction:${roomId}`;
}

function init(io) {
  ioInstance = io;
}

async function joinRoom(socket, roomId) {
  if (!socket || !roomId) return;
  await socket.join(roomChannel(roomId));
}

async function leaveRoom(socket, roomId) {
  if (!socket || !roomId) return;
  await socket.leave(roomChannel(roomId));
}

function emitToRoom(roomId, event, data) {
  if (!ioInstance || !roomId) return;
  ioInstance.to(roomChannel(roomId)).emit(event, data);
}

function emitToSocket(socketId, event, data) {
  if (!ioInstance || !socketId) return;
  ioInstance.to(socketId).emit(event, data);
}

async function getRoomSockets(roomId) {
  if (!ioInstance || !roomId) return [];
  const sockets = await ioInstance.in(roomChannel(roomId)).fetchSockets();
  return sockets.map((socket) => socket.id);
}

module.exports = {
  init,
  joinRoom,
  leaveRoom,
  emitToRoom,
  emitToSocket,
  getRoomSockets
};
