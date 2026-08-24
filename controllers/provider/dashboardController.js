const db = require("../../config/db");

// DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  const provider_id = req.user ? req.user.id : parseInt(req.query.provider_id);
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
      `SELECT COALESCE(SUM(total_price), 0) AS earnings_this_month
       FROM bookings
       WHERE provider_id = ? AND status = 'completed'
         AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`, [provider_id]);
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
  const provider_id = req.user ? req.user.id : parseInt(req.query.provider_id);
  try {
    const [rows] = await db.query(
      `SELECT b.id, u.full_name AS customer_name, u.phone AS customer_phone,
              COALESCE(s.name, 'Home Service') AS service_type, b.scheduled_date, b.scheduled_time,
              b.location, b.total_price AS price, b.status, 1 AS is_new
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       LEFT JOIN services s ON s.id = b.service_id
       WHERE b.provider_id = ? AND b.status = 'pending'
       ORDER BY b.created_at DESC`, [provider_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ALL JOBS
exports.getAllJobs = async (req, res) => {
  const provider_id = req.user ? req.user.id : parseInt(req.query.provider_id);
  try {
    const [rows] = await db.query(
      `SELECT b.id, u.full_name AS customer_name, u.phone AS customer_phone,
              COALESCE(s.name, 'Home Service') AS service_type, b.scheduled_date, b.scheduled_time,
              b.location, b.total_price AS price, b.status, 0 AS is_new
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       LEFT JOIN services s ON s.id = b.service_id
       WHERE b.provider_id = ? AND b.status != 'pending'
       ORDER BY b.created_at DESC`, [provider_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ACCEPT JOB
exports.acceptJob = async (req, res) => {
  const jobId = req.params.id;
  const providerId = req.user.id;
  try {
    const [[booking]] = await db.query(
      `SELECT provider_id, customer_id FROM bookings WHERE id = ?`, [jobId]);
    if (!booking) return res.status(404).json({ message: "Job not found" });

    // Ownership check — only the assigned provider can accept
    if (booking.provider_id !== providerId) {
      return res.status(403).json({ message: "Forbidden: This job is not assigned to you" });
    }

    const [[profile]] = await db.query(
      `SELECT pending_commission, security_deposit_status FROM provider_profiles WHERE user_id = ?`,
      [providerId]);

    // Security deposit check
    if (profile && profile.security_deposit_status !== 'verified') {
      return res.status(403).json({
        message: "Security deposit required before accepting jobs",
        code: "SECURITY_DEPOSIT_REQUIRED"
      });
    }

    // Pending commission check
    if (profile && parseFloat(profile.pending_commission) > 0) {
      return res.status(403).json({
        message: "Please pay pending commission before accepting new jobs",
        code: "COMMISSION_DUE",
        commission_due: parseFloat(profile.pending_commission)
      });
    }

    await db.query(`UPDATE bookings SET status = 'accepted' WHERE id = ?`, [jobId]);

    try {
      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         VALUES (?, 'customer', 'Booking Accepted!', 'Your booking has been accepted by the provider.', 'booking', 0)`,
        [booking.customer_id]);
    } catch (e) { console.error('Notif error:', e.message); }

    res.json({ message: "Job accepted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DECLINE JOB
exports.declineJob = async (req, res) => {
  const providerId = req.user.id;
  try {
    // Fetch booking FIRST (before update) to verify ownership
    const [[booking]] = await db.query(
      `SELECT customer_id, provider_id FROM bookings WHERE id = ?`, [req.params.id]);
    if (!booking) return res.status(404).json({ message: "Job not found" });

    if (booking.provider_id !== providerId) {
      return res.status(403).json({ message: "Forbidden: This job is not assigned to you" });
    }

    await db.query(
      `UPDATE bookings SET status = 'declined' WHERE id = ?`, [req.params.id]);

    try {
      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         VALUES (?, 'customer', 'Booking Declined', 'Unfortunately your booking was declined by the provider.', 'booking', 0)`,
        [booking.customer_id]);
    } catch (e) { console.error('Notif error:', e.message); }

    res.json({ message: "Job declined" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// UPDATE JOB STATUS
exports.updateJobStatus = async (req, res) => {
  const { status } = req.body;
  const bookingId = parseInt(req.params.id);
  const providerId = req.user.id;

  const ALLOWED_STATUSES = ['accepted', 'on_the_way', 'in_progress', 'completed'];
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` });
  }

  try {
    const [[booking]] = await db.query(
      `SELECT customer_id, provider_id, total_price FROM bookings WHERE id = ?`, [bookingId]);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Ownership check
    if (booking.provider_id !== providerId) {
      return res.status(403).json({ message: "Forbidden: This booking is not assigned to you" });
    }

    await db.query(
      `UPDATE bookings SET status = ? WHERE id = ?`, [status, bookingId]);

    // Notification for customer
    const messages = {
      accepted:    { title: 'Booking Confirmed',   msg: 'Your booking has been confirmed.' },
      on_the_way:  { title: 'Provider On The Way', msg: 'Your provider is on the way to your location.' },
      in_progress: { title: 'Work Started',        msg: 'Your service is now in progress.' },
      completed:   { title: 'Job Completed',       msg: 'Your booking has been marked as completed.' },
    };
    const notif = messages[status];
    if (notif) {
      try {
        await db.query(
          `INSERT INTO notifications (user_id, role, title, message, type, is_read)
           VALUES (?, 'customer', ?, ?, 'booking', 0)`,
          [booking.customer_id, notif.title, notif.msg]);
      } catch (e) { console.error('Notif error:', e.message); }
    }

    let commissionTriggered = false;
    let commissionAmount = 0;

    // ── Commission calculation: job 3rd onwards ──
    if (status === 'completed') {
      const [[{ completedCount }]] = await db.query(
        `SELECT COUNT(*) AS completedCount FROM bookings WHERE provider_id = ? AND status = 'completed'`,
        [booking.provider_id]);

      if (completedCount > 2) {
        commissionAmount = parseFloat(booking.total_price) * 0.10;
        await db.query(
          `UPDATE provider_profiles SET pending_commission = pending_commission + ? WHERE user_id = ?`,
          [commissionAmount, booking.provider_id]);

        commissionTriggered = true;

        try {
          await db.query(
            `INSERT INTO notifications (user_id, role, title, message, type, is_read)
             VALUES (?, 'provider', 'Commission Due', ?, 'admin', 0)`,
            [booking.provider_id, `RS ${commissionAmount.toFixed(0)} commission added. Pay before accepting new jobs.`]);
        } catch (e) { console.error('Notif error:', e.message); }
      }
    }

    res.json({
      message: "Status updated",
      commission_triggered: commissionTriggered,
      commission_amount: commissionAmount,
    });
  } catch (err) {
    console.error('UPDATE STATUS ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// SUBMIT COMMISSION
exports.submitCommission = async (req, res) => {
  const provider_id = req.user ? req.user.id : parseInt(req.body.provider_id);
  const { amount, payment_method } = req.body;
  const screenshot = req.file?.filename ?? (req.body.screenshot || 'commission_placeholder.jpg');
  try {
    await db.query(
      `INSERT INTO commission_payments (provider_id, amount, payment_method, screenshot, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [provider_id, amount, payment_method, screenshot]);

    // NOTE: Do NOT zero pending_commission here — only zero after admin VERIFIES the payment
    // pending_commission is reduced in admincommissionController.verifyCommission

    // Admin ko notify karo
    try {
      const [[provider]] = await db.query(
        `SELECT u.full_name FROM users u WHERE u.id = ?`, [provider_id]);

      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         SELECT id, 'admin', 'Commission Submitted',
                CONCAT('Provider ', ?, ' ne RS ', ?, ' commission submit ki'), 'admin', 0
         FROM users WHERE role = 'admin' LIMIT 1`,
        [provider?.full_name ?? 'Unknown', amount]);
    } catch (e) { console.error('Notif error:', e.message); }

    res.json({ message: "Commission submitted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET EARNINGS
exports.getEarnings = async (req, res) => {
  const pid = req.user ? req.user.id : parseInt(req.query.provider_id);
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

// GET NOTIFICATIONS
exports.getNotifications = async (req, res) => {
  const pid = req.user ? req.user.id : parseInt(req.query.provider_id);
  try {
    const [rows] = await db.query(
      `SELECT id, title, message, type, is_read,
              DATE_FORMAT(created_at, '%b %d') AS date,
              TIMESTAMPDIFF(MINUTE, created_at, NOW()) AS minutes_ago
       FROM notifications
       WHERE (user_id = ? OR user_id IS NULL) AND role = 'provider'
       ORDER BY created_at DESC
       LIMIT 20`, [pid]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
// MARK NOTIFICATION AS READ
exports.markNotificationRead = async (req, res) => {
  const notifId = parseInt(req.params.id);
  try {
    await db.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [notifId]);
    res.json({ message: "Marked as read" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
// CLEAR ALL NOTIFICATIONS (Provider)
exports.clearNotifications = async (req, res) => {
  const pid = req.user ? req.user.id : parseInt(req.query.provider_id);
  try {
    await db.query(
      `DELETE FROM notifications WHERE user_id = ? AND role = 'provider'`,
      [pid]
    );
    res.json({ message: "Notifications cleared" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
// POST submit complaint (provider against customer)
exports.submitComplaint = async (req, res) => {
  const provider_id = req.user ? req.user.id : parseInt(req.body.provider_id);
  const { booking_id, title, message } = req.body;
  try {
    const [[booking]] = await db.query(
      `SELECT customer_id FROM bookings WHERE id = ?`, [booking_id]);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await db.query(
      `INSERT INTO complaints (user_id, booking_id, title, message, status, against_user_id, complainant_role)
       VALUES (?, ?, ?, ?, 'pending', ?, 'provider')`,
      [provider_id, booking_id, title, message, booking.customer_id]);

    try {
      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         SELECT id, 'admin', 'New Complaint',
                CONCAT('New complaint filed against a customer (booking #', ?, ')'), 'complaint', 0
         FROM users WHERE role = 'admin' LIMIT 1`, [booking_id]);
    } catch (e) { console.error('Notif error:', e.message); }

    res.json({ message: "Complaint submitted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
// SUBMIT SECURITY DEPOSIT
exports.submitSecurityDeposit = async (req, res) => {
  const pid = req.user ? req.user.id : parseInt(req.body.provider_id);
  const method = req.body.payment_method || 'easypaisa';
  const screenshot = req.file?.filename ?? (req.body.screenshot || 'deposit_placeholder.jpg');

  try {
    await db.query(
      `UPDATE provider_profiles 
       SET security_deposit_status = 'submitted', security_deposit_screenshot = ?, security_deposit_method = ?
       WHERE user_id = ?`,
      [screenshot, method, pid]);

    try {
      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         SELECT id, 'admin', 'Security Deposit Submitted',
                CONCAT('Provider #', ?, ' submitted security deposit proof'), 'admin', 0
         FROM users WHERE role = 'admin' LIMIT 1`,
        [pid]);
    } catch (e) { console.error('Notif error:', e.message); }

    res.json({ message: "Security deposit submitted, awaiting verification" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET SECURITY DEPOSIT STATUS
exports.getSecurityDepositStatus = async (req, res) => {
  const pid = req.user ? req.user.id : parseInt(req.query.provider_id);
  try {
    const [[row]] = await db.query(
      `SELECT security_deposit_status FROM provider_profiles WHERE user_id = ?`, [pid]);
    
    // Fetch dynamic amount from app_settings
    const [[settings]] = await db.query(
      `SELECT security_deposit_amount, security_deposit_required FROM app_settings LIMIT 1`
    );
    
    const requiredAmount = settings ? settings.security_deposit_amount : 500;
    const isRequired = settings ? settings.security_deposit_required : 1;

    res.json({
      status: row?.security_deposit_status ?? 'pending',
      amount: requiredAmount,
      required: isRequired
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
