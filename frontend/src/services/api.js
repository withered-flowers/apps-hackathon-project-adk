import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s — agent calls can be slow
});

/**
 * Send a chat message and receive an agent response.
 * @param {string} sessionId
 * @param {string} message
 * @returns {Promise<{session_id, agent, response, status, matrix}>}
 */
export async function sendMessage(sessionId, message) {
  const res = await api.post('/chat', { session_id: sessionId, message });
  return res.data;
}

/**
 * Retrieve conversation history for a session.
 * @param {string} sessionId
 * @returns {Promise<{session_id, messages, matrix}>}
 */
export async function getHistory(sessionId) {
  const res = await api.get(`/history/${sessionId}`);
  return res.data;
}

/**
 * Get a fresh session ID from the server.
 * @returns {Promise<string>}
 */
export async function newSession() {
  const res = await api.get('/session/new');
  return res.data.session_id;
}

/**
 * Export the current session report to Google Drive.
 * @param {string} sessionId
 * @returns {Promise<{session_id, drive_url}>}
 */
export async function exportToDrive(sessionId) {
  const res = await api.post(`/export/${sessionId}`);
  return res.data;
}

export default api;
