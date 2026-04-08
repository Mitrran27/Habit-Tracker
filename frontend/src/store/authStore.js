import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user:    null,
  token:   localStorage.getItem('ht_token') || null,
  loading: false,
  error:   null,

  setUser: (user) => set({ user }),

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('ht_token', data.data.token);
      set({ user: data.data.user, token: data.data.token, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      set({ error: msg, loading: false });
      return { success: false, error: msg };
    }
  },

  register: async (formData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.register(formData);
      localStorage.setItem('ht_token', data.data.token);
      set({ user: data.data.user, token: data.data.token, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      set({ error: msg, loading: false });
      return { success: false, error: msg };
    }
  },

  fetchMe: async () => {
    if (!get().token) return;
    try {
      const { data } = await authAPI.me();
      set({ user: data.data.user });
    } catch {
      get().logout();
    }
  },

  updateProfile: async (updates) => {
    try {
      const { data } = await authAPI.updateProfile(updates);
      set({ user: data.data.user });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  },

  logout: () => {
    localStorage.removeItem('ht_token');
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
