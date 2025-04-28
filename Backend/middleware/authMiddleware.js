// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // e.g. { user_id, role_id, ... }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // If allowedRoles array is not empty, check if user's role_id exists in allowedRoles
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
