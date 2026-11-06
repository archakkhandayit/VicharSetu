import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

// Lazy socket: autoConnect is disabled so idle pages (Landing, Dashboard, Voting) use 0 connections.
export const socket = io(SERVER_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
})

export default socket
