import User from "../models/user.model.js";
import { verifyAccessToken } from "../utils/token.utils.js";

const extractAccessToken = (req) => {
  // 1. Primary: HttpOnly cookie
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  // 2. Fallback: Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

export const protect = async (req, res, next) => {
  try {
    const token = extractAccessToken(req);

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: Access token missing",
      });
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized: Invalid or expired access token",
      expired: error.name === "TokenExpiredError",
    });
  }
};

export const getAuth = async (req, res, next) => {
  try {
    const token = extractAccessToken(req);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyAccessToken(token);

    let user = null;
    if (decoded?.userId) {
      user = await User.findById(decoded.userId);
    }

    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};
