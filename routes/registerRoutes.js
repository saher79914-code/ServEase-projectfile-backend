// routes/registerRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerCustomer,
  registerProvider,
  registerAdmin,
  login,
  getMe,
} = require("../controllers/registerController");

// Simple JWT middleware — inline
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

router.post("/register/customer", registerCustomer);
router.post("/register/provider", registerProvider);
router.post("/register/admin",    registerAdmin);
router.post("/login",             login);
router.get("/me",                 authMiddleware, getMe);

module.exports = router;