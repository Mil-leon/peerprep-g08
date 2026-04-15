const redisClient = require('../config/redis');
const { getQueueKeys } = require('../utils/queueKeys');
const { socketState, findQueues, cleanupSocket } = require('../services/matchingService');

const handleFindMatch = async (io, socket, data) => {
  const { languages, topics, difficulty } = data;
  const userId = socket.userId; // sourced from verified JWT, not client payload

  // Basic validation
  if (!userId || !Array.isArray(languages) || languages.length === 0 ||
      !Array.isArray(topics) || topics.length === 0 || !difficulty) {
    socket.emit('error', { message: 'Invalid find-match payload.' });
    return;
  }

  // Re-joining Attempt
  if (socketState.has(socket.id)) {
    console.log(`User ${userId} (${socket.id}) re-joining — clearing previous search state`);
    await cleanupSocket(socket.id);
  }

  const criteria = { languages, topics, difficulty };

  // This allows me to search for user in queue in one lookup
  const serializedEntry = JSON.stringify({ socketId: socket.id, userId });

  // Mark this user as actively waiting in Redis so concurrent match attempts
  await redisClient.set(`user_state:${userId}`, 'WAITING', { EX: 300 });

  socketState.set(socket.id, {
    userId,
    serializedEntry,
    queues: new Set(),
    relaxationTimers: [],   
    statusInterval: null,  
    startedAt: Date.now(),
    relaxationLevel: 0,
    criteria,
  });

  console.log(`User ${userId} (${socket.id}) searching — languages: [${languages}], topics: [${topics}], difficulty: ${difficulty}`);

  // Level 0 match: full criteria
  const initialKeys = getQueueKeys(criteria, 0);
  await findQueues(io, socket, initialKeys);

  const state = socketState.get(socket.id);
  if (!state) return;

  // At 30s: relax difficulty — search queue:{lang}:{topic} keys
  const t30 = setTimeout(async () => {
    if (!socketState.has(socket.id)) return;
    state.relaxationLevel = 1;
    socket.emit('criteria-relaxed', { level: 1, message: 'Difficulty constraint relaxed. Expanding search...' });
    // Level 1: queue:{topic}:{lang} — difficulty dropped
    await findQueues(io, socket, getQueueKeys(criteria, 1));
  }, 30_000);

  // At 60s: relax topic — search queue:{lang} keys
  const t60 = setTimeout(async () => {
    if (!socketState.has(socket.id)) return;
    state.relaxationLevel = 2;
    socket.emit('criteria-relaxed', { level: 2, message: 'Language constraint relaxed. Expanding search...' });
    // Level 2: queue:{topic} — language dropped, topic is the only remaining constraint
    await findQueues(io, socket, getQueueKeys(criteria, 2));
  }, 60_000);

  // At 120s: no match found, terminate search
  const t120 = setTimeout(async () => {
    if (!socketState.has(socket.id)) return;
    await cleanupSocket(socket.id);
    socket.emit('match-timeout', { message: 'No match found within 2 minutes.' });
  }, 120_000);

  state.relaxationTimers = [t30, t60, t120];
};

const handleDisconnect = async (socket) => {
  console.log('User disconnected:', socket.id);
  await cleanupSocket(socket.id);
};

const handleCancelMatch = async (socket) => {
  await cleanupSocket(socket.id);
  socket.emit('match-cancelled', { message: 'Search cancelled.' });
};

module.exports = {
  handleFindMatch,
  handleDisconnect,
  handleCancelMatch,
};
