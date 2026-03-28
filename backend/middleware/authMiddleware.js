// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      // 👇 Guard: if token was valid but user was deleted from DB
      if (!req.user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      return next(); // ✅ return so nothing below runs
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: "Not authorized, token failed" }); // ✅ return
    }
  }

  // This only runs if the Authorization header was missing entirely
  return res.status(401).json({ message: "Not authorized, no token" }); // ✅ return
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access only" });
};