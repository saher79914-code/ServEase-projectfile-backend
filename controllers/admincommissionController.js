const db = require("../config/db");

// GET all commission payments
exports.getAllCommissions = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cp.id, cp.amount, cp.payment_method, cp.screenshot, cp.status,
              DATE_FORMAT(cp.created_at, '%b %d, %Y') AS created_at,
              u.full_name AS provider_name
       FROM commission_payments cp
       JOIN users u ON u.id = cp.provider_id
       ORDER BY cp.created_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT verify — also clears pending_commission from provider profile
exports.verifyCommission = async (req, res) => {
  try {
    const [[payment]] = await db.query(
      `SELECT provider_id FROM commission_payments WHERE id = ?`, [req.params.id]);
    if (!payment) return res.status(404).json({ message: "Commission payment not found" });

    await db.query(
      `UPDATE commission_payments SET status = 'verified' WHERE id = ?`, [req.params.id]);

    // Now it's safe to clear pending commission — admin has confirmed the payment
    await db.query(
      `UPDATE provider_profiles SET pending_commission = 0 WHERE user_id = ?`,
      [payment.provider_id]);

    // Notify provider
    try {
      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         VALUES (?, 'provider', 'Commission Verified', 'Your commission payment has been verified by admin. You can now accept new jobs.', 'admin', 0)`,
        [payment.provider_id]);
    } catch (e) { console.error('Notif error:', e.message); }

    res.json({ message: "Commission verified" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT reject
exports.rejectCommission = async (req, res) => {
  try {
    await db.query(
      `UPDATE commission_payments SET status = 'rejected' WHERE id = ?`, [req.params.id]);
    res.json({ message: "Commission rejected" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};