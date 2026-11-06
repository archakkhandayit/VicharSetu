import { Server } from "socket.io";
import mongoose from "mongoose";
import Poll from "./models/poll.model.js";
import { verifyAccessToken } from "./utils/token.utils.js";
import { getAllowedOrigins } from "./config/cors.config.js";

let io = null;

// Parse cookie string from raw HTTP handshake headers
const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce((res, c) => {
    const [k, ...v] = c.trim().split("=");
    if (k) res[k] = decodeURIComponent(v.join("="));
    return res;
  }, {});
};

// Extract token from cookies, auth object, or Authorization header
const extractHandshakeToken = (socket) => {
  // 1. Primary: HttpOnly cookie in handshake headers
  const cookieHeader = socket.handshake.headers?.cookie;
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    if (cookies.accessToken) {
      return cookies.accessToken;
    }
  }

  // 2. Secondary: auth object from socket.io-client
  const authToken = socket.handshake.auth?.token;
  if (authToken) {
    return authToken.startsWith("Bearer ") ? authToken.split(" ")[1] : authToken;
  }

  // 3. Fallback: Authorization header
  const authHeader = socket.handshake.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const allowed = getAllowedOrigins();
        const normalized = origin.replace(/\/$/, "");
        if (allowed.includes(normalized) || process.env.NODE_ENV !== "production") {
          return callback(null, true);
        }
        return callback(new Error(`Socket CORS error: Origin ${origin} not allowed`));
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // ─── Layer 1: Handshake Authentication Middleware ──────────────────────────
  io.use((socket, next) => {
    const token = extractHandshakeToken(socket);

    if (!token) {
      // Allow connection but mark as unauthenticated
      socket.user = null;
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.user = decoded; // { userId: string, ... }
      return next();
    } catch (err) {
      // Reject handshake if token is invalid or expired
      return next(new Error("Authentication failed: Invalid or expired access token"));
    }
  });

  io.on("connection", (socket) => {
    // ─── Layer 2: Room-Level Authorization Guard ──────────────────────────────
    socket.on("join_poll", async (pollId) => {
      try {
        // 1. Must be authenticated
        if (!socket.user?.userId) {
          return socket.emit("error", {
            code: "UNAUTHORIZED",
            message: "Authentication required to subscribe to live poll analytics",
          });
        }

        // 2. Validate pollId format
        if (!pollId || !mongoose.Types.ObjectId.isValid(pollId)) {
          return socket.emit("error", {
            code: "BAD_REQUEST",
            message: "Invalid poll ID provided",
          });
        }

        // 3. Verify poll existence & ownership in database
        const poll = await Poll.findById(pollId).select("createdBy isPublished");
        if (!poll) {
          return socket.emit("error", {
            code: "NOT_FOUND",
            message: "Poll not found",
          });
        }

        // 4. Object-Level Authorization: ONLY poll creator can view private live analytics
        if (poll.createdBy.toString() !== socket.user.userId) {
          return socket.emit("error", {
            code: "FORBIDDEN",
            message: "Forbidden: You do not have permission to view live analytics for this poll",
          });
        }

        // 5. If poll results are already published, voting is closed; sockets are not needed
        if (poll.isPublished) {
          return socket.emit("poll_static", {
            code: "POLL_PUBLISHED",
            message: "This poll is published and closed. Live streaming is inactive.",
          });
        }

        // 6. Authorized: Join room
        socket.join(`poll_${pollId}`);
        socket.emit("joined_poll", { pollId });
      } catch (err) {
        console.error("Socket join_poll error:", err);
        socket.emit("error", {
          code: "SERVER_ERROR",
          message: "Failed to join poll analytics room",
        });
      }
    });

    // Leave poll room
    socket.on("leave_poll", (pollId) => {
      if (pollId) {
        socket.leave(`poll_${pollId}`);
      }
    });

    socket.on("disconnect", () => {
      // Socket automatically leaves all rooms upon disconnect
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};
