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
// GET EARNINGS
// exports.getEarnings = async (req, res) => {
//   const { provider_id } = req.query;
//   console.log("EARNINGS HIT - provider_id:", provider_id); // ← add karo
//   try {
//     // 1. Total earned
//     const [[{ total_earned }]] = await db.query(
//       `SELECT COALESCE(SUM(py.amount), 0) AS total_earned
//        FROM payment py
//        JOIN bookings b ON b.id = py.booking_id
//        WHERE b.provider_id = ? AND py.status = 'paid'`,
//       [provider_id]
//     );
//     console.log("TOTAL EARNED:", total_earned); // ← add karo

//     // 2. Commission due
//     const [[{ pending_commission }]] = await db.query(
//       `SELECT COALESCE(pending_commission, 0) AS pending_commission
//        FROM provider_profiles WHERE user_id = ?`,
//       [provider_id]
//     );

//     // 3. Monthly earnings - last 4 months (MIN fix kiya GROUP BY error ke liye)
//     const [monthly] = await db.query(
//       `SELECT DATE_FORMAT(MIN(py.created_at), '%b') AS month,
//               COALESCE(SUM(py.amount), 0)           AS amount
//        FROM payment py
//        JOIN bookings b ON b.id = py.booking_id
//        WHERE b.provider_id = ?
//          AND py.status = 'paid'
//          AND py.created_at >= DATE_SUB(NOW(), INTERVAL 4 MONTH)
//        GROUP BY DATE_FORMAT(py.created_at, '%Y-%m')
//        ORDER BY DATE_FORMAT(py.created_at, '%Y-%m') ASC`,
//       [provider_id]
//     );

//     // 4. Transaction history - last 10
//     const [rows] = await db.query(
//       `SELECT b.id, b.total_price AS price, MAX(py.created_at) AS created_at,
//               s.name AS service_name, u.full_name AS customer_name,
//               MAX(cp.amount) AS commission_amount,
//               (SELECT COUNT(*) FROM bookings b2
//                WHERE b2.provider_id = b.provider_id
//                  AND b2.status = 'completed'
//                  AND b2.id <= b.id) AS job_number
//        FROM bookings b
//        JOIN users u    ON u.id = b.customer_id
//        JOIN services s ON s.id = b.service_id
//        JOIN payment py ON py.booking_id = b.id AND py.status = 'paid'
//        LEFT JOIN commission_payments cp ON cp.provider_id = b.provider_id
//        WHERE b.provider_id = ? AND b.status = 'completed'
//        GROUP BY b.id, b.total_price, s.name, u.full_name
//        ORDER BY created_at DESC LIMIT 10`,
//       [provider_id]
//     );

//     const transactions = rows.map((r) => {
//       const isFree  = r.job_number <= 2;
//       const dateStr = new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
//       const subtitle = isFree
//         ? `${dateStr} · Free (job #${r.job_number})`
//         : r.commission_amount
//         ? `${dateStr} · Commission: RS ${r.commission_amount} paid`
//         : dateStr;
//       return { title: `${r.service_name} — ${r.customer_name}`, subtitle, amount: parseFloat(r.price), is_free: isFree };
//     });

//     res.json({
//       total_earned:   parseFloat(total_earned),
//       commission_due: parseFloat(pending_commission),
//       monthly,
//       transactions,
//     });
//   } catch (err) { res.status(500).json({ message: err.message }); }
// };
exports.getEarnings = async (req, res) => {
  const { provider_id } = req.query;
  const pid = parseInt(provider_id); // ← add
  try {
    const [[{ total_earned }]] = await db.query(
      `SELECT COALESCE(SUM(total_price), 0) AS total_earned 
       FROM bookings WHERE provider_id = ? AND status = 'completed'`, [pid]);

    const [[provider]] = await db.query(
      `SELECT pending_commission FROM provider_profiles WHERE user_id = ?`, [pid]);

    const [monthly] = await db.query(
  `SELECT DATE_FORMAT(created_at, '%b') AS month,
          COALESCE(SUM(total_price), 0) AS amount
   FROM bookings
   WHERE provider_id = ? AND status = 'completed'
     AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
   GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
   ORDER BY DATE_FORMAT(created_at, '%Y-%m')`, [pid]);

    const [transactions] = await db.query(
      `SELECT s.name AS service, u.full_name AS customer,
              DATE_FORMAT(b.created_at, '%b %d') AS date,
              b.total_price AS amount,
              ROW_NUMBER() OVER (PARTITION BY b.provider_id ORDER BY b.created_at) AS job_number
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       JOIN services s ON s.id = b.service_id
       WHERE b.provider_id = ? AND b.status = 'completed'
       ORDER BY b.created_at DESC`, [pid]);

    res.json({
      total_earned,
      commission_due: provider?.pending_commission ?? 0,
      monthly: monthly.map(m => ({ month: m.month, amount: parseFloat(m.amount) })),
      transactions: transactions.map((t) => ({
        title: `${t.service} — ${t.customer}`,
        subtitle: t.date,
        amount: parseFloat(t.amount),
        is_free: t.job_number <= 2,
      })),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};