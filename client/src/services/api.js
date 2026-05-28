import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pb_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
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