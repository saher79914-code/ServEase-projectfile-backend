const db = require("../../config/db");

// DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  const { provider_id } = req.query;
  try {
    const [[provider]] = await db.query(
      `SELECT u.full_name, p.rating, p.commission_rate, p.pending_commission
       FROM provider_profiles p JOIN users u ON u.id = p.user_id WHERE p.user_id = ?`,
      [provider_id]
    );
    let providerName = provider?.full_name;
    if (!providerName) {
      const [[user]] = await db.query(`SELECT full_name FROM users WHERE id = ?`, [provider_id]);
      providerName = user?.full_name ?? "Provider";
    }
    const [[{ jobs_done }]] = await db.query(
      `SELECT COUNT(*) AS jobs_done FROM bookings WHERE provider_id = ? AND status = 'completed'`, [provider_id]);
    const [[{ new_requests }]] = await db.query(
      `SELECT COUNT(*) AS new_requests FROM bookings WHERE provider_id = ? AND status = 'pending'`, [provider_id]);
    const [[{ earnings_this_month }]] = await db.query(
      `SELECT COALESCE(SUM(py.amount), 0) AS earnings_this_month
       FROM payment py JOIN bookings b ON b.id = py.booking_id
       WHERE b.provider_id = ? AND py.status = 'paid'
         AND MONTH(py.created_at) = MONTH(CURDATE()) AND YEAR(py.created_at) = YEAR(CURDATE())`, [provider_id]);
    res.json({
      provider_name: providerName,
      rating: provider?.rating ?? 0,
      commission_rate: provider?.commission_rate ?? 10,
      pending_commission: provider?.pending_commission ?? 0,
      jobs_done, new_requests, earnings_this_month,
      total_jobs_completed: jobs_done,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// NEW JOBS (pending)
exports.getNewJobs = async (req, res) => {
  const { provider_id } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT b.id, u.full_name AS customer_name, u.phone AS customer_phone,
              s.name AS service_type, b.scheduled_date, b.scheduled_time,
              b.location, b.total_price AS price, b.status, 1 AS is_new
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       JOIN services s ON s.id = b.service_id
       WHERE b.provider_id = ? AND b.status = 'pending'
       ORDER BY b.created_at DESC`, [provider_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ALL JOBS (my jobs page)
exports.getAllJobs = async (req, res) => {
  const { provider_id } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT b.id, u.full_name AS customer_name, u.phone AS customer_phone,
              s.name AS service_type, b.scheduled_date, b.scheduled_time,
              b.location, b.total_price AS price, b.status, 0 AS is_new
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       JOIN services s ON s.id = b.service_id
       WHERE b.provider_id = ?
       ORDER BY b.created_at DESC`, [provider_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ACCEPT JOB
exports.acceptJob = async (req, res) => {
  try {
    await db.query(`UPDATE bookings SET status = 'accepted' WHERE id = ?`, [req.params.id]);
    res.json({ message: "Job accepted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DECLINE JOB
exports.declineJob = async (req, res) => {
  try {
    await db.query(`UPDATE bookings SET status = 'declined' WHERE id = ?`, [req.params.id]);
    res.json({ message: "Job declined" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// UPDATE JOB STATUS (confirmed/on_the_way/in_progress/completed)
exports.updateJobStatus = async (req, res) => {
  const { status } = req.body;
  try {
    await db.query(`UPDATE bookings SET status = ? WHERE id = ?`, [status, req.params.id]);
    res.json({ message: "Status updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// SUBMIT COMMISSION
exports.submitCommission = async (req, res) => {
  const { provider_id, amount, payment_method } = req.body;
  const screenshot = req.file?.filename ?? null;
  try {
    await db.query(
      `INSERT INTO commission_payments (provider_id, amount, payment_method, screenshot, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [provider_id, amount, payment_method, screenshot]
    );
    await db.query(
      `UPDATE provider_profiles SET pending_commission = 0 WHERE user_id = ?`, [provider_id]);
    res.json({ message: "Commission submitted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};