export const rooms = new Map();

export function createRoom(id, questionId = null) {
  rooms.set(id, {
    id,
    questionId,
    users: [],
    messages: [],
  });
}

export function getRoom(id) {
  return rooms.get(id);
}

export function deleteRoom(id) {
  rooms.delete(id);
}

// NOTE: user here is the User object in frontend
export function addUserToRoom(id, user) {
  const room = rooms.get(id);
  if (!room) return { error: "Room not found", data: null };

  if (room.users.find((u) => u.id === user.id))
    return { error: null, data: room };

  if (room.users.length >= 2) return { error: "Room is full", data: null };

  room.users.push(user);
  return { error: null, data: room };
}
