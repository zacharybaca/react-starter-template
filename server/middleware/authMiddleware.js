import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Ensure the payload key matches your generateToken utility (usually userId)
      req.user = await User.findById(decoded.userId).select("-password");

      if (req.user) return next();
    } catch (error) {
      if (req.originalUrl !== "/api/users/me") {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    }
  }

  if (req.originalUrl === "/api/users/me") {
    return next();
  }

  res.status(401);
  throw new Error("Not authorized, no token");
});

// For strictly Admin-only routes (e.g., Company management)
const admin = (req, res, next) => {
  if (req.user && (req.user.isAdmin || req.user.role === "Admin")) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as an admin");
  }
};

// NEW: For Manager-only or Admin access (e.g., Article Approvals)
const manager = (req, res, next) => {
  if (req.user && (req.user.role === "Manager" || req.user.role === "Admin")) {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied. Manager role required.");
  }
};

export { protect, admin, manager };
