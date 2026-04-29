import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s — agent calls can be slow
});

// ── Auth interceptor ──────────────────────────────────────────────────────────
// Automatically attach the Firebase ID token to every outgoing request
// when a user is logged in.

api.interceptors.request.use(async (config) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // Silently continue without token — backend treats as anonymous
  }
  return config;
});

/**
 * Helper to get the current Authorization header for non-axios requests (e.g. XHR, fetch).
 * @returns {Promise<string|null>}
 */
async function getAuthHeader() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return token ? `Bearer ${token}` : null;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Send a chat message and receive real-time SSE status updates.
 * @param {string} sessionId
 * @param {string} message
 * @param {function} onStatus - callback({agent, status}) for badge
 * @param {function} onProgress - callback({agent, status, message}) for chat
 * @param {function} onRateLimit - callback({remaining, reset}) for rate limit tracking
 * @returns {Promise<{session_id, agent, response, status, matrix}>}
 */
export async function sendMessage(sessionId, message, onStatus, onProgress, onRateLimit) {
  const authHeader = await getAuthHeader();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/chat/stream`);
    xhr.setRequestHeader("Content-Type", "application/json");
    if (authHeader) {
      xhr.setRequestHeader("Authorization", authHeader);
    }
    xhr.timeout = 120000;

    let buffer = "";

    xhr.onprogress = () => {
      const text = xhr.responseText.slice(buffer.length);
      buffer = xhr.responseText;
      const lines = text.split("\n");
      let eventType = "";
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith("data: ") && eventType) {
          try {
            const data = JSON.parse(line.slice(6));
            if (eventType === "status" && onStatus) {
              onStatus(data);
            } else if (eventType === "progress" && onProgress) {
              onProgress(data);
            } else if (eventType === "ratelimit" && onRateLimit) {
              onRateLimit(data);
            } else if (eventType === "done") {
              resolve(data);
            }
          } catch {
            // skip malformed JSON
          }
          eventType = "";
        }
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 400) {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.ontimeout = () => reject(new Error("Request timed out"));

    xhr.send(JSON.stringify({ session_id: sessionId, message }));
  });
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
 * Get the 5 most recent sessions.
 * @returns {Promise<Array>}
 */
export async function getRecentSessions() {
  const res = await api.get('/sessions/recent');
  return res.data.sessions;
}

/**
 * Download the decision report as a markdown file.
 * @param {string} sessionId
 * @returns {Promise<void>}
 */
export async function downloadMarkdownReport(sessionId) {
  const headers = {};
  const authHeader = await getAuthHeader();
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  const res = await fetch(`${API_BASE}/export/${sessionId}/download`, { headers });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get('Content-Disposition');
  let filename = 'decidely-report.md';
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match) {
      filename = match[1];
    }
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Redeem a voucher code to upgrade rate limits.
 * @param {string} code - Voucher code to redeem
 * @returns {Promise<{status: string, new_limit: string|null, message: string}>}
 */
export async function redeemVoucher(code) {
  const res = await api.post("/voucher/redeem", { code });
  return res.data;
}

export async function getUserStatus() {
  const res = await api.get("/user/status");
  return res.data;
}

export default api;
