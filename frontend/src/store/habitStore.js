import { create } from 'zustand';
import { habitsAPI } from '../services/api';

const useHabitStore = create((set, get) => ({
  habits:  [],
  loading: false,
  error:   null,

  fetchHabits: async (params) => {
    set({ loading: true, error: null });
    try {
      const { data } = await habitsAPI.list(params);
      set({ habits: data.data.habits, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to load habits', loading: false });
    }
  },

  createHabit: async (formData) => {
    try {
      const { data } = await habitsAPI.create(formData);
      set((s) => ({ habits: [data.data.habit, ...s.habits] }));
      return { success: true, habit: data.data.habit, achievements: data.data.achievements };
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  },

  updateHabit: async (id, formData) => {
    try {
      const { data } = await habitsAPI.update(id, formData);
      set((s) => ({
        habits: s.habits.map((h) => (h.id === id ? { ...h, ...data.data.habit } : h)),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  },

  archiveHabit: async (id) => {
    try {
      await habitsAPI.archive(id);
      set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  },

  checkIn: async (id, payload = {}) => {
    try {
      const { data } = await habitsAPI.checkIn(id, payload);
      set((s) => ({
        habits: s.habits.map((h) =>
          h.id === id
            ? {
                ...h,
                completed_today:  payload.status !== 'missed',
                current_streak:   data.data.streak.current_streak,
                best_streak:      data.data.streak.best_streak,
              }
            : h
        ),
      }));
      return { success: true, achievements: data.data.achievements };
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  },

  undoCheckIn: async (id) => {
    try {
      const { data } = await habitsAPI.undoCheckIn(id);
      set((s) => ({
        habits: s.habits.map((h) =>
          h.id === id
            ? { ...h, completed_today: false, current_streak: data.data.streak.current_streak }
            : h
        ),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  },

  getById: (id) => get().habits.find((h) => h.id === id) || null,
}));

export default useHabitStore;
