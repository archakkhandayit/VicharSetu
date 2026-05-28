import { create } from 'zustand'
import { getMe } from '../services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('pb_token') || null,
  loading: true,

  setAuth: (token, user) => {
    localStorage.setItem('pb_token', token)
    set({ token, user, loading: false })
  },

  logout: () => {
    localStorage.removeItem('pb_token')
    set({ token: null, user: null, loading: false })
  },

  fetchMe: async () => {
    const token = localStorage.getItem('pb_token')
    if (!token) {
      set({ loading: false })
      return
    }
    try {
      const res = await getMe()
      set({ user: res.data, loading: false })
    } catch {
      localStorage.removeItem('pb_token')
      set({ token: null, user: null, loading: false })
    }
  },

  isAuthenticated: () => !!get().token,
}))

export default useAuthStore