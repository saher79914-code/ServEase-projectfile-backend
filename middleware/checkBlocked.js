const db = require("../config/db");

const checkBlocked = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) return next();

    const [[user]] = await db.query(
      `SELECT is_blocked FROM users WHERE id = ?`, [userId]
    );

    if (user && user.is_blocked === 1) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by admin.",
        blocked: true,
      });
    }

   return res.status(500).json({
  success: false,
  message: "Internal Server Error",
});
  } catch (err) {
    console.error("checkBlocked error:", err.message);
    next();
  }
};

module.exports = checkBlocked;