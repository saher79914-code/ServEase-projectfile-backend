const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication required. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user is blocked
    const [[user]] = await db.query(
      "SELECT id, role, is_blocked FROM users WHERE id = ? LIMIT 1",
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (user.is_blocked == 1) {
      return res.status(403).json({ success: false, message: "Your account has been blocked" });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = authMiddleware;