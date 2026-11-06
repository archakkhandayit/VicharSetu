import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Automatically sends and receives HttpOnly cookies
})

// Silent Refresh Queue
let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401 Unauthorized handling
    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = originalRequest.url || ''

      // Skip refresh for auth endpoints to prevent infinite retry loops
      if (
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/refresh')
      ) {
        return Promise.reject(error)
      }

      // If a refresh is already in progress, queue subsequent requests
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Calls refresh endpoint; browser sends refreshToken cookie and receives new cookies
        await api.post('/auth/refresh')
        processQueue(null)
        return api(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr)
        window.dispatchEvent(new Event('auth_session_expired'))
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// Auth APIs
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const refreshToken = () => api.post('/auth/refresh')
export const logoutApi = () => api.post('/auth/logout')
export const getMe = () => api.get('/auth/me')

// Polls
export const createPoll = (data) => api.post('/polls', data)
export const getMyPolls = () => api.get('/polls/me')
export const getPublicPoll = (publicLink) => api.get(`/polls/public/${publicLink}`)
export const publishPollResults = (pollId) => api.patch(`/polls/${pollId}/publish`)
export const deletePoll = (pollId) => api.delete(`/polls/${pollId}`)

// Responses
export const submitResponse = (pollId, data) => api.post(`/responses/${pollId}`, data)
export const getPollAnalytics = (pollId) => api.get(`/responses/analytics/${pollId}`)

export default api
