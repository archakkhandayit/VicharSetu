import { create } from 'zustand'
import { getMe, logoutApi } from '../services/api'

// Clean up any legacy localStorage token from previous builds
if (typeof window !== 'undefined') {
  localStorage.removeItem('pb_token')
}

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  setAuth: (arg1, arg2) => {
    const user = arg2 || arg1
    set({ user, loading: false })
  },

  logout: async () => {
    try {
      await logoutApi()
    } catch {
      // Ignore network errors on logout
    }
    set({ user: null, loading: false })
  },

  fetchMe: async () => {
    try {
      const res = await getMe()
      set({ user: res.data, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  isAuthenticated: () => !!get().user,
}))

// Global listener for session expiry from axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth_session_expired', () => {
    if (useAuthStore.getState().user) {
      useAuthStore.setState({ user: null, loading: false })
    }
  })
}

export default useAuthStore
