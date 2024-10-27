// utils/sessionManager.js

const sessions = {};

/**
 * Creates a new session for a user.
 * @param {string} userId - The unique identifier for the user.
 * @param {Array} questions - The array of questions for the session.
 */
function createSession(userId, questions) {
  sessions[userId] = {
    currentQuestionIndex: 0,
    facetScores: {},      // Initialize facetScores as an empty object
    domainScores: {},     // Initialize domainScores as an empty object
    questions: questions, // Array of question objects
  };
  console.log(`Session created for userId: ${userId}`);
}

/**
 * Retrieves the session for a given user.
 * @param {string} userId - The unique identifier for the user.
 * @returns {object|null} - The session object or null if not found.
 */
function getSession(userId) {
  return sessions[userId] || null;
}

/**
 * Updates the session for a given user with new data.
 * @param {string} userId - The unique identifier for the user.
 * @param {object} updates - An object containing the properties to update.
 */
function updateSession(userId, updates) {
  if (sessions[userId]) {
    sessions[userId] = { ...sessions[userId], ...updates };
    console.log(`Session updated for userId: ${userId}`, updates);
  } else {
    console.warn(`Attempted to update non-existent session for userId: ${userId}`);
  }
}

/**
 * Deletes the session for a given user.
 * @param {string} userId - The unique identifier for the user.
 */
function deleteSession(userId) {
  if (sessions[userId]) {
    delete sessions[userId];
    console.log(`Session deleted for userId: ${userId}`);
  } else {
    console.warn(`Attempted to delete non-existent session for userId: ${userId}`);
  }
}

module.exports = {
  createSession,
  getSession,
  updateSession,
  deleteSession,
};