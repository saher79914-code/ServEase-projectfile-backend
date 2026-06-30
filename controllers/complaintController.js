const db = require("../config/db");

// GET ALL COMPLAINTS
exports.getComplaints = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.title, c.message, c.status, c.admin_response, c.created_at,
              c.booking_id, c.complainant_role, c.against_user_id,
              u1.full_name AS complainant_name, u1.id AS complainant_id,
              u2.full_name AS against_name, u2.role AS against_role, u2.is_blocked,
              (SELECT COUNT(*) FROM complaints WHERE against_user_id = c.against_user_id) AS total_complaints_against
       FROM complaints c
       LEFT JOIN users u1 ON u1.id = c.user_id
       LEFT JOIN users u2 ON u2.id = c.against_user_id
       ORDER BY c.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// TAKE ACTION ON COMPLAINT
exports.takeAction = async (req, res) => {
  const complaintId = parseInt(req.params.id);
  const { action, admin_response } = req.body; // 'warn' | 'block' | 'dismiss'

  const ALLOWED_ACTIONS = ['warn', 'block', 'dismiss'];
  if (!action || !ALLOWED_ACTIONS.includes(action)) {
    return res.status(400).json({
      success: false,
      message: `Invalid action. Allowed values: ${ALLOWED_ACTIONS.join(', ')}`
    });
  }

  try {
    const [[complaint]] = await db.query(`SELECT * FROM complaints WHERE id = ?`, [complaintId]);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (action === 'warn') {
      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         SELECT id, role, 'Warning from Admin', ?, 'admin', 0
         FROM users WHERE id = ?`,
        [admin_response || 'You have received a complaint. Please follow platform guidelines.', complaint.against_user_id]);

      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         VALUES (?, ?, 'Complaint Update', ?, 'complaint', 0)`,
        [complaint.user_id, complaint.complainant_role, `Your complaint (ID: #${complaintId}) has been resolved. A warning has been issued.`]
      );

      await db.query(
        `UPDATE complaints SET status = 'warned', admin_response = ? WHERE id = ?`,
        [admin_response || 'Warning issued', complaintId]);
    }

    if (action === 'block') {
      // Same logic as userController.blockUser
      await db.query(`UPDATE users SET is_blocked = 1 WHERE id = ?`, [complaint.against_user_id]);

      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         SELECT id, role, 'Account Blocked', ?, 'admin', 0
         FROM users WHERE id = ?`,
        [admin_response || 'Your account has been blocked due to repeated complaints.', complaint.against_user_id]);

      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         VALUES (?, ?, 'Complaint Update', ?, 'complaint', 0)`,
        [complaint.user_id, complaint.complainant_role, `Your complaint (ID: #${complaintId}) has been resolved. The user has been blocked.`]
      );

      await db.query(
        `UPDATE complaints SET status = 'blocked', admin_response = ? WHERE id = ?`,
        [admin_response || 'User blocked', complaintId]);
    }

    if (action === 'dismiss') {
      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         VALUES (?, ?, 'Complaint Update', ?, 'complaint', 0)`,
        [complaint.user_id, complaint.complainant_role, `Your complaint (ID: #${complaintId}) has been reviewed and dismissed.`]
      );

      await db.query(
        `UPDATE complaints SET status = 'dismissed', admin_response = ? WHERE id = ?`,
        [admin_response || 'No action needed', complaintId]);
    }

    res.json({ success: true, message: "Action taken" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET ALL RATINGS
exports.getRatings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.rating, r.note, r.created_at, r.provider_id, r.customer_id,
              uc.full_name AS customer_name,
              up.full_name AS provider_name
       FROM ratings r
       JOIN users uc ON uc.id = r.customer_id
       JOIN users up ON up.id = r.provider_id
       ORDER BY r.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};