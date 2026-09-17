const lastActivity = {};

function recordActivity(userId) {
  if (!userId) return;

  lastActivity[userId] = Date.now();
}

function getLastActivity(userId) {
  if (!userId) return 0;

  return lastActivity[userId] || 0;
}

module.exports = {
  recordActivity,
  getLastActivity,
};
