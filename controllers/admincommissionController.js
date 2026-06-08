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

// PUT verify
exports.verifyCommission = async (req, res) => {
  try {
    await db.query(
      `UPDATE commission_payments SET status = 'verified' WHERE id = ?`, [req.params.id]);
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