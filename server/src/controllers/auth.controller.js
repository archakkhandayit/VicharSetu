import User from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  getCookieOptions,
  ACCESS_TOKEN_MAX_AGE_MS,
  REFRESH_TOKEN_MAX_AGE_MS,
} from "../utils/token.utils.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    // 1. Generate Access & Refresh tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 2. Hash & persist Refresh Token in database
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      userAgent: req.headers["user-agent"] || "Unknown",
      ipAddress: req.ip || req.headers["x-forwarded-for"] || null,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
    });

    // 3. Set HttpOnly cookies
    res.cookie("accessToken", accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
    res.cookie("refreshToken", refreshToken, getCookieOptions(REFRESH_TOKEN_MAX_AGE_MS));

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // 1. Generate Access & Refresh tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 2. Hash & persist Refresh Token in database
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      userAgent: req.headers["user-agent"] || "Unknown",
      ipAddress: req.ip || req.headers["x-forwarded-for"] || null,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
    });

    // 3. Set HttpOnly cookies
    res.cookie("accessToken", accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
    res.cookie("refreshToken", refreshToken, getCookieOptions(REFRESH_TOKEN_MAX_AGE_MS));

    res.status(200).json({
      message: "Login successful",
      accessToken,
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!rawRefreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    // 1. Verify JWT signature & expiration
    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }

    // 2. Check token in database via SHA-256 hash
    const hashed = hashToken(rawRefreshToken);
    const existingToken = await RefreshToken.findOne({
      tokenHash: hashed,
      userId: decoded.userId,
    });

    // Reuse detection: If token was already rotated/deleted, revoke all sessions for this user!
    if (!existingToken) {
      await RefreshToken.deleteMany({ userId: decoded.userId });
      res.clearCookie("accessToken", getCookieOptions(0));
      res.clearCookie("refreshToken", getCookieOptions(0));
      return res.status(403).json({
        message: "Security alert: Refresh token reuse detected. Please log in again.",
      });
    }

    // 3. Rotate token: Delete the consumed refresh token
    await existingToken.deleteOne();

    // 4. Issue fresh tokens
    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    // 5. Store new refresh token hash in DB
    await RefreshToken.create({
      userId: decoded.userId,
      tokenHash: hashToken(newRefreshToken),
      userAgent: req.headers["user-agent"] || "Unknown",
      ipAddress: req.ip || req.headers["x-forwarded-for"] || null,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
    });

    // 6. Set updated HttpOnly cookies
    res.cookie("accessToken", newAccessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
    res.cookie("refreshToken", newRefreshToken, getCookieOptions(REFRESH_TOKEN_MAX_AGE_MS));

    const user = await User.findById(decoded.userId);

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      user: user
        ? {
            id: user._id,
            name: user.name,
            email: user.email,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (rawRefreshToken) {
      const hashed = hashToken(rawRefreshToken);
      await RefreshToken.deleteOne({ tokenHash: hashed });
    }

    // Clear HttpOnly cookies
    res.clearCookie("accessToken", getCookieOptions(0));
    res.clearCookie("refreshToken", getCookieOptions(0));

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
};
