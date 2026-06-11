const db = require("../config/db");

// SEND NOTIFICATION (Admin)
exports.sendNotification = async (req, res) => {
  try {
    const { user_id, title, message, type, role } = req.body;

    const allowedTypes = ["verification", "complaint", "system", "booking", "admin"];
    if (!allowedTypes.includes(type || "system")) {
      return res.status(400).json({ success: false, message: "Invalid notification type" });
    }

    await db.query(
      `INSERT INTO notifications (user_id, role, title, message, type, is_read)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [user_id || null, role || "customer", title, message, type || "system"]
    );

    res.status(200).json({ success: true, message: "Notification sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET ALL NOTIFICATIONS (Admin view)
exports.getAllNotifications = async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT n.id, n.title, n.message, n.type, n.role, n.is_read,
              n.created_at, u.full_name AS user_name
       FROM notifications n
       LEFT JOIN users u ON u.id = n.user_id
       ORDER BY n.created_at DESC
       LIMIT 50`
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET NOTIFICATIONS (User side)
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const [result] = await db.query(
      `SELECT * FROM notifications
       WHERE user_id = ? OR user_id IS NULL
       ORDER BY created_at DESC`,
      [userId]
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};