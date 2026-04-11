import { create } from 'zustand';
import { api } from '../utils/api.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isLoading: true,

  init: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return set({ isLoading: false });
    try {
      const { data } = await api.get('/users/me');
      set({ user: data, isLoading: false });
    } catch {
      localStorage.clear();
      set({ user: null, accessToken: null, isLoading: false });
    }
  },

  login: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, accessToken });
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, accessToken: null });
  },

  updateUser: (updates) => set(state => ({ user: { ...state.user, ...updates } })),
}));