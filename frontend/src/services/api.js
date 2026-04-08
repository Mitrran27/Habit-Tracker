import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ht_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ht_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ───────────────────────────────────────────────────
export const authAPI = {
  register:      (data) => api.post('/auth/register', data),
  login:         (data) => api.post('/auth/login', data),
  me:            ()     => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
  forgotPassword:(data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  deleteAccount: ()     => api.delete('/auth/me'),
};

// ── Habits ─────────────────────────────────────────────────
export const habitsAPI = {
  list:       (params) => api.get('/habits', { params }),
  get:        (id)     => api.get(`/habits/${id}`),
  create:     (data)   => api.post('/habits', data),
  update:     (id, data) => api.patch(`/habits/${id}`, data),
  archive:    (id)     => api.delete(`/habits/${id}`),
  restore:    (id)     => api.post(`/habits/${id}/restore`),
  checkIn:    (id, data) => api.post(`/habits/${id}/checkin`, data),
  undoCheckIn:(id)     => api.delete(`/habits/${id}/checkin`),
  logs:       (id, params) => api.get(`/habits/${id}/logs`, { params }),
  calendar:   (id, params) => api.get(`/habits/${id}/calendar`, { params }),
  freeze:     (id)     => api.post(`/habits/${id}/freeze`),
};

// ── Stats ──────────────────────────────────────────────────
export const statsAPI = {
  dashboard:       () => api.get('/stats/dashboard'),
  weekly:          () => api.get('/stats/weekly'),
  monthly:         () => api.get('/stats/monthly'),
  categories:      () => api.get('/stats/categories'),
  moodCorrelation: () => api.get('/stats/mood-correlation'),
  bestWorst:       () => api.get('/stats/best-worst'),
  heatmap:         () => api.get('/stats/heatmap'),
};

// ── Journal ────────────────────────────────────────────────
export const journalAPI = {
  list:        (params) => api.get('/journal', { params }),
  get:         (id)     => api.get(`/journal/${id}`),
  create:      (data)   => api.post('/journal', data),
  update:      (id, data) => api.patch(`/journal/${id}`, data),
  delete:      (id)     => api.delete(`/journal/${id}`),
  moodHistory: (params) => api.get('/journal/mood-history', { params }),
};

// ── Friends ────────────────────────────────────────────────
export const friendsAPI = {
  list:        () => api.get('/friends'),
  leaderboard: () => api.get('/friends/leaderboard'),
  sendRequest: (data) => api.post('/friends/request', data),
  accept:      (data) => api.post('/friends/accept', data),
  remove:      (friendId) => api.delete(`/friends/${friendId}`),
};

// ── Achievements ───────────────────────────────────────────
export const achievementsAPI = {
  all:    () => api.get('/achievements'),
  earned: () => api.get('/achievements/earned'),
};

export default api;
