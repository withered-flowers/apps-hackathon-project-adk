import axios from 'axios';

// Fast API default runs on port 8000 locally
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendChat = async (sessionId, message) => {
  const response = await apiClient.post('/chat', {
    session_id: sessionId,
    message: message,
  });
  return response.data;
};

export const getHistory = async (sessionId) => {
  const response = await apiClient.get(`/history/${sessionId}`);
  return response.data;
};
