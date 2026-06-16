const db = require("../config/db");

// GET ALL SECURITY DEPOSITS (submitted + verified + rejected)
exports.getSecurityDeposits = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.full_name AS provider_name, u.email, u.phone,
              p.security_deposit_status AS status,
              p.security_deposit_screenshot AS screenshot,
              p.security_deposit_method AS payment_method
       FROM provider_profiles p
       JOIN users u ON u.id = p.user_id
       WHERE p.security_deposit_status IN ('submitted', 'verified', 'rejected')
       ORDER BY u.id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// VERIFY
exports.verifyDeposit = async (req, res) => {
  const pid = parseInt(req.params.id);
  try {
    await db.query(
      `UPDATE provider_profiles SET security_deposit_status = 'verified' WHERE user_id = ?`, [pid]);
    try {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type, is_read)
         VALUES (?, 'Security Deposit Verified', 'Your security deposit has been verified. You can now accept jobs!', 'admin', 0)`,
        [pid]);
    } catch (e) { console.error('Notif error:', e.message); }
    res.json({ success: true, message: "Verified" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// REJECT
exports.rejectDeposit = async (req, res) => {
  const pid = parseInt(req.params.id);
  try {
    await db.query(
      `UPDATE provider_profiles SET security_deposit_status = 'rejected' WHERE user_id = ?`, [pid]);
    try {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type, is_read)
         VALUES (?, 'Security Deposit Rejected', 'Your security deposit proof was rejected. Please resubmit.', 'admin', 0)`,
        [pid]);
    } catch (e) { console.error('Notif error:', e.message); }
    res.json({ success: true, message: "Rejected" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};