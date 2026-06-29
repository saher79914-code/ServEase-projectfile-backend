const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

const { getDashboardStats } = require("../controllers/adminController");

router.get("/dashboard", authMiddleware, adminOnly, getDashboardStats);

module.exports = router;