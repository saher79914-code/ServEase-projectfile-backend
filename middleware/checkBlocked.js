const db = require("../config/db");

const checkBlocked = async (req, res, next) => {
  try {
    const userId =
      req.query.provider_id ||
      req.query.customer_id ||
      req.body.provider_id ||
      req.body.customer_id ||
      req.params.id;

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

    next();
  } catch (err) {
    console.error("checkBlocked error:", err.message);
    next();
  }
};

module.exports = checkBlocked;