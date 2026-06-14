const db = require("../config/db");

const allowedTypes = ["verification", "complaint", "system", "booking", "admin"];
const allowedRoles = ["customer", "provider"];

// SEND NOTIFICATION (Admin)
exports.sendNotification = async (req, res) => {
  try {
    const { user_id, title, message, type, role } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message required" });
    }

    const notifType = type || "system";
    const notifRole = role || "customer";

    if (!allowedTypes.includes(notifType)) {
      return res.status(400).json({ success: false, message: "Invalid notification type" });
    }
    if (!allowedRoles.includes(notifRole)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    await db.query(
      `INSERT INTO notifications (user_id, role, title, message, type, is_read)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [user_id || null, notifRole, title, message, notifType]
    );

    res.status(200).json({ success: true, message: "Notification sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET ALL NOTIFICATIONS (Admin view) — with sender/receiver info
exports.getAllNotifications = async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT n.id, n.title, n.message, n.type, n.role, n.is_read,
              n.created_at, n.user_id,
              u.full_name AS user_name, u.email AS user_email
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

// GET NOTIFICATIONS (User side — generic)
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
// CLEAR ALL NOTIFICATIONS (Admin — deletes everything)
exports.clearAllNotifications = async (req, res) => {
  try {
    await db.query(`DELETE FROM notifications`);
    res.status(200).json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};