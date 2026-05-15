import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import verifyToken from "../utils/verifyToken.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.userId
    );

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
    });
  }
};


const getAuth = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;

    // NO TOKEN
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      req.user = null;

      return next();
    }

    const token = authHeader.split(" ")[1];

    let user;

    const decoded = await verifyToken(token);


    if (decoded?.userId) {
      user = await User.findById(
        decoded.userId
      );
    }

    req.user = user || null;

    next();
  } catch (error) {
    req.user = null;

    next();
  }
};

export {
  protect,
  getAuth
}
