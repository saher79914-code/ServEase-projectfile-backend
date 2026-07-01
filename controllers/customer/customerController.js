const db = require("../../config/db");

// GET home data
exports.getHomeData = async (req, res) => {
  const userId = req.user ? req.user.id : parseInt(req.query.user_id);
  try {
    const [[customer]] = await db.query(
      `SELECT full_name, address AS city FROM users WHERE id = ?`, [userId]);

    const [services] = await db.query(
      `SELECT id, name, icon, category, price FROM services WHERE is_active = 1 ORDER BY id`);

    const [providers] = await db.query(
      `SELECT u.id, u.full_name AS name, s.name AS service, s.category,
              p.rating, p.hourly_rate AS rate, p.approval_status,
              (SELECT COUNT(*) FROM bookings WHERE provider_id = u.id AND status = 'completed') AS jobs_done,
              (CASE WHEN p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS is_new
       FROM provider_profiles p
       JOIN users u ON u.id = p.user_id
       JOIN services s ON s.id = p.service_id
       WHERE p.approval_status = 'approved'
       ORDER BY p.rating DESC LIMIT 10`);

    res.json({
      customer_name: customer?.full_name ?? 'Customer',
      city:          customer?.city ?? '',
      services,
      top_providers: providers.map(p => ({
        id:          p.id,
        name:        p.name,
        service:     p.service,
        category:    p.category,
        rating:      parseFloat(p.rating),
        rate:        p.rate,
        jobs_done:   p.jobs_done,
        is_verified: p.approval_status === 'approved' ? 1 : 0,
        is_new:      p.is_new,
      })),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET providers (all or by category)
exports.getProviders = async (req, res) => {
  const { category } = req.query;
  try {
    let query = `
      SELECT u.id, u.full_name AS name, s.name AS service, s.category,
             p.rating, p.hourly_rate AS rate, p.approval_status,
             (SELECT COUNT(*) FROM bookings WHERE provider_id = u.id AND status = 'completed') AS jobs_done,
             (CASE WHEN p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS is_new
      FROM provider_profiles p
      JOIN users u ON u.id = p.user_id
      JOIN services s ON s.id = p.service_id
      WHERE p.approval_status = 'approved'`;

    const params = [];
    if (category && category !== 'all') {
      query += ` AND s.category = ?`;
      params.push(category);
    }
    query += ` ORDER BY p.rating DESC`;

    const [providers] = await db.query(query, params);

    res.json(providers.map(p => ({
      id:          p.id,
      name:        p.name,
      service:     p.service,
      category:    p.category,
      rating:      parseFloat(p.rating),
      rate:        p.rate,
      jobs_done:   p.jobs_done,
      is_verified: p.approval_status === 'approved' ? 1 : 0,
      is_new:      p.is_new,
    })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET provider detail
exports.getProviderDetail = async (req, res) => {
  const providerId = parseInt(req.params.id);
  try {
    const [[provider]] = await db.query(
      `SELECT u.id, u.full_name AS name, s.name AS service, s.category,
              p.rating, p.hourly_rate AS rate, p.approval_status,
              u.address AS location, p.bio,
              (SELECT COUNT(*) FROM bookings WHERE provider_id = u.id AND status = 'completed') AS jobs_done
       FROM provider_profiles p
       JOIN users u ON u.id = p.user_id
       JOIN services s ON s.id = p.service_id
       WHERE u.id = ?`, [providerId]);

    if (!provider) return res.status(404).json({ message: "Provider not found" });

    // All services by this provider's category
    const [services] = await db.query(
      `SELECT name FROM services WHERE category = ? AND is_active = 1`, [provider.category]);

    res.json({
      id:               provider.id,
      name:             provider.name,
      service:          provider.service,
      category:         provider.category,
      rating:           parseFloat(provider.rating),
      rate:             provider.rate,
      jobs_done:        provider.jobs_done,
      location:         provider.location ?? '',
      bio:              provider.bio ?? '',
      is_verified:      provider.approval_status === 'approved' ? 1 : 0,
      services_offered: services.map(s => s.name),
      reviews:          [], // reviews table baad mein add hogi
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST create booking
exports.createBooking = async (req, res) => {
  const customer_id = req.user ? req.user.id : parseInt(req.body.customer_id);
  const { provider_id, service_id, scheduled_date, scheduled_time, location, total_price } = req.body;
  try {
    const [[profile]] = await db.query(
      `SELECT service_id FROM provider_profiles WHERE user_id = ?`, [provider_id]);

    const [result] = await db.query(
      `INSERT INTO bookings (customer_id, provider_id, service_id, scheduled_date, scheduled_time, location, total_price, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [customer_id, provider_id, profile?.service_id ?? service_id, scheduled_date, scheduled_time, location, total_price]);

    // ── Customer ko confirmation ──
    await db.query(
      `INSERT INTO notifications (user_id, role, title, message, type, is_read)
       VALUES (?, 'customer', 'Booking Submitted', 'Your booking request has been sent to the provider.', 'booking', 0)`,
      [customer_id]);

    // ── Provider ko new request ──
    await db.query(
      `INSERT INTO notifications (user_id, role, title, message, type, is_read)
       VALUES (?, 'provider', 'New Booking Request', 'You have a new booking request. Check your jobs.', 'booking', 0)`,
      [provider_id]);

    res.json({ message: "Booking created", booking_id: result.insertId });
  } catch (err) {
    console.error('BOOKING ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// GET customer bookings
exports.getMyBookings = async (req, res) => {
  const customerId = req.user ? req.user.id : parseInt(req.query.customer_id);
  try {
    const [rows] = await db.query(
      `SELECT b.id, b.provider_id, u.full_name AS provider_name, s.name AS service_name,
              b.scheduled_date, b.scheduled_time, b.status, b.total_price
       FROM bookings b
       JOIN users u ON u.id = b.provider_id
       JOIN services s ON s.id = b.service_id
       WHERE b.customer_id = ?
       ORDER BY b.created_at DESC`, [customerId]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET customer profile
exports.getProfile = async (req, res) => {
  const userId = req.user ? req.user.id : parseInt(req.query.user_id);
  try {
    const [[user]] = await db.query(
      `SELECT u.full_name, u.email, u.phone, u.address, u.profile_image,
              DATE_FORMAT(u.created_at, '%Y') AS member_since,
              (SELECT COUNT(*) FROM bookings WHERE customer_id = u.id) AS total_bookings,
              (SELECT COUNT(*) FROM bookings WHERE customer_id = u.id AND status IN ('pending','accepted','in_progress')) AS active_bookings
       FROM users u WHERE u.id = ?`, [userId]);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT update profile
exports.updateProfile = async (req, res) => {
  const userId = req.user ? req.user.id : parseInt(req.query.user_id);
  const { full_name, phone, address } = req.body;
  let profile_image = req.body.profile_image;
  if (req.file) {
    profile_image = `/uploads/profile/${req.file.filename}`;
  }
  try {
    if (profile_image) {
      await db.query(
        `UPDATE users SET full_name = ?, phone = ?, address = ?, profile_image = ? WHERE id = ?`,
        [full_name, phone, address, profile_image, userId]);
    } else {
      await db.query(
        `UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?`,
        [full_name, phone, address, userId]);
    }
    res.json({ message: "Profile updated", profile_image });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT change password
exports.changePassword = async (req, res) => {
  const userId = req.user ? req.user.id : parseInt(req.query.user_id);
  const { current_password, new_password } = req.body;
  if (!new_password || new_password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }
  const bcrypt = require("bcryptjs");
  try {
    const [[user]] = await db.query(`SELECT password FROM users WHERE id = ?`, [userId]);
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
    const hashed = await bcrypt.hash(new_password, 12);
    await db.query(`UPDATE users SET password = ? WHERE id = ?`, [hashed, userId]);
    res.json({ message: "Password changed successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [[user]] = await db.query(`SELECT id FROM users WHERE email = ?`, [email]);
    if (!user) return res.status(404).json({ message: "Email not found" });
    // In production: send email with reset link
    // For now: just confirm email exists
    res.json({ message: "Reset link sent to your email" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET notifications
exports.getNotifications = async (req, res) => {
  const customerId = req.user ? req.user.id : parseInt(req.query.customer_id);
  try {
    const [rows] = await db.query(
      `SELECT id, title, message, type, is_read, created_at
       FROM notifications
       WHERE (user_id = ? OR user_id IS NULL) AND role = 'customer'
       ORDER BY created_at DESC`,
      [customerId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT mark notification as read
exports.markNotificationRead = async (req, res) => {
  const notifId = parseInt(req.params.id);
  try {
    await db.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [notifId]);
    res.json({ message: "Marked as read" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
// CLEAR ALL NOTIFICATIONS (Customer)
exports.clearNotifications = async (req, res) => {
  const customerId = req.user ? req.user.id : parseInt(req.query.customer_id);
  try {
    await db.query(
      `DELETE FROM notifications WHERE user_id = ? AND role = 'customer'`,
      [customerId]
    );
    res.json({ message: "Notifications cleared" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
// POST submit complaint (customer against provider)
exports.submitComplaint = async (req, res) => {
  const customer_id = req.user ? req.user.id : parseInt(req.body.customer_id);
  const { booking_id, title, message } = req.body;
  try {
    const [[booking]] = await db.query(
      `SELECT provider_id FROM bookings WHERE id = ?`, [booking_id]);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await db.query(
      `INSERT INTO complaints (user_id, booking_id, title, message, status, against_user_id, complainant_role)
       VALUES (?, ?, ?, ?, 'pending', ?, 'customer')`,
      [customer_id, booking_id, title, message, booking.provider_id]);

    try {
      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         SELECT id, 'customer', 'New Complaint',
                CONCAT('New complaint filed against a provider (booking #', ?, ')'), 'complaint', 0
         FROM users WHERE role = 'admin' LIMIT 1`, [booking_id]);
    } catch (e) { console.error('Notif error:', e.message); }

    res.json({ message: "Complaint submitted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST submit rating
exports.submitRating = async (req, res) => {
  const customer_id = req.user ? req.user.id : parseInt(req.body.customer_id);
  const { booking_id, provider_id, rating, note } = req.body;

  const ratingNum = parseInt(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    await db.query(
      `INSERT INTO ratings (booking_id, customer_id, provider_id, rating, note)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = ?, note = ?`,
      [booking_id, customer_id, provider_id, ratingNum, note || null, ratingNum, note || null]);

    const [[avg]] = await db.query(
      `SELECT AVG(rating) AS avg_rating FROM ratings WHERE provider_id = ?`, [provider_id]);
    await db.query(
      `UPDATE provider_profiles SET rating = ? WHERE user_id = ?`,
      [avg.avg_rating || 0, provider_id]);

    try {
      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         SELECT id, 'customer', 'New Rating Received',
                CONCAT('A provider received a ', ?, '-star rating'), 'system', 0
         FROM users WHERE role = 'admin' LIMIT 1`, [rating]);
    } catch (e) { console.error('Notif error:', e.message); }

    res.json({ message: "Rating submitted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};