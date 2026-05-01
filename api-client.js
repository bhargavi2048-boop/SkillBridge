/**
 * SkillBridge — API Client (js/api-client.js)
 * Centralized fetch wrapper for all backend API calls
 */

'use strict';

const API_BASE = window.SKILLBRIDGE_API || 'http://localhost:5000/api';

// ─── TOKEN MANAGEMENT ────────────────────────────────────────────────────────
const Auth = {
  getToken: () => localStorage.getItem('sb_token'),
  setToken: (t) => localStorage.setItem('sb_token', t),
  removeToken: () => localStorage.removeItem('sb_token'),
  getUser: () => { try { return JSON.parse(localStorage.getItem('sb_user')); } catch { return null; } },
  setUser: (u) => localStorage.setItem('sb_user', JSON.stringify(u)),
  removeUser: () => localStorage.removeItem('sb_user'),
  isLoggedIn: () => !!localStorage.getItem('sb_token')
};

// ─── FETCH HELPER ─────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
  } catch (e) {
    // Fallback to localStorage when backend unavailable (demo mode)
    console.warn('API unavailable, using demo mode:', e.message);
    throw e;
  }
}

// ─── AUTH API ─────────────────────────────────────────────────────────────────
const AuthAPI = {
  register: (data) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => apiFetch('/auth/me'),
  changePassword: (data) => apiFetch('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) })
};

// ─── USERS API ────────────────────────────────────────────────────────────────
const UsersAPI = {
  browse: (params = {}) => apiFetch('/users?' + new URLSearchParams(params)),
  getById: (id) => apiFetch(`/users/${id}`),
  updateProfile: (data) => apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  endorseSkill: (userId, skillName, swapId) => apiFetch(`/users/${userId}/endorse-skill`, { method: 'POST', body: JSON.stringify({ skillName, swapId }) })
};

// ─── SWAPS API ────────────────────────────────────────────────────────────────
const SwapsAPI = {
  getMySwaps: (status) => apiFetch('/swaps' + (status ? `?status=${status}` : '')),
  create: (data) => apiFetch('/swaps', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, action) => apiFetch(`/swaps/${id}`, { method: 'PUT', body: JSON.stringify({ action }) })
};

// ─── SESSIONS API ─────────────────────────────────────────────────────────────
const SessionsAPI = {
  getMySessions: () => apiFetch('/sessions'),
  create: (data) => apiFetch('/sessions', { method: 'POST', body: JSON.stringify(data) })
};

// ─── MESSAGES API ─────────────────────────────────────────────────────────────
const MessagesAPI = {
  getHistory: (roomId, page = 1) => apiFetch(`/messages/${roomId}?page=${page}`),
  markRead: (roomId) => apiFetch(`/messages/${roomId}/read`, { method: 'PUT' })
};

// ─── REVIEWS API ──────────────────────────────────────────────────────────────
const ReviewsAPI = {
  getForUser: (userId) => apiFetch(`/reviews/${userId}`),
  submit: (data) => apiFetch('/reviews', { method: 'POST', body: JSON.stringify(data) })
};

// ─── NOTIFICATIONS API ────────────────────────────────────────────────────────
const NotificationsAPI = {
  getAll: () => apiFetch('/notifications'),
  markRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => apiFetch('/notifications/read-all', { method: 'PUT' })
};

// ─── SKILLS API ───────────────────────────────────────────────────────────────
const SkillsAPI = {
  getAll: () => apiFetch('/skills'),
  getMatches: (userId) => apiFetch(`/skills/match/${userId}`)
};

// ─── ADMIN API ────────────────────────────────────────────────────────────────
const AdminAPI = {
  getStats: () => apiFetch('/admin/stats'),
  getUsers: (params) => apiFetch('/admin/users?' + new URLSearchParams(params)),
  banUser: (id, ban, reason) => apiFetch(`/admin/users/${id}/ban`, { method: 'PUT', body: JSON.stringify({ ban, reason }) }),
  deleteReview: (id) => apiFetch(`/admin/reviews/${id}`, { method: 'DELETE' })
};

window.Auth = Auth;
window.AuthAPI = AuthAPI;
window.UsersAPI = UsersAPI;
window.SwapsAPI = SwapsAPI;
window.SessionsAPI = SessionsAPI;
window.MessagesAPI = MessagesAPI;
window.ReviewsAPI = ReviewsAPI;
window.NotificationsAPI = NotificationsAPI;
window.SkillsAPI = SkillsAPI;
window.AdminAPI = AdminAPI;
