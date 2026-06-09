const db = require("../../config/db");

// GET home data
exports.getHomeData = async (req, res) => {
  const userId = parseInt(req.query.user_id);
  try {
    const [[customer]] = await db.query(
      `SELECT full_name, address AS city FROM users WHERE id = ?`, [userId]);

    const [services] = await db.query(
      `SELECT id, name, icon, category, price FROM services WHERE is_active = 1 ORDER BY id LIMIT 8`);

    const [providers] = await db.query(
      `SELECT u.id, u.full_name AS name, s.name AS service, s.category,
              p.rating, s.price AS rate, p.approval_status,
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
             p.rating, s.price AS rate, p.approval_status,
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
              p.rating, s.price AS rate, p.approval_status,
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
  const { customer_id, provider_id, service_id, scheduled_date, scheduled_time, location, total_price } = req.body;
  try {
    // Get service_id from provider
    const [[profile]] = await db.query(
      `SELECT service_id FROM provider_profiles WHERE user_id = ?`, [provider_id]);

    const [result] = await db.query(
      `INSERT INTO bookings (customer_id, provider_id, service_id, scheduled_date, scheduled_time, location, total_price, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [customer_id, provider_id, profile?.service_id ?? service_id, scheduled_date, scheduled_time, location, total_price]);

    res.json({ message: "Booking created", booking_id: result.insertId });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET customer bookings
exports.getMyBookings = async (req, res) => {
  const customerId = parseInt(req.query.customer_id);
  try {
    const [rows] = await db.query(
      `SELECT b.id, u.full_name AS provider_name, s.name AS service_name,
              b.scheduled_date, b.scheduled_time, b.status, b.total_price
       FROM bookings b
       JOIN users u ON u.id = b.provider_id
       JOIN services s ON s.id = b.service_id
       WHERE b.customer_id = ?
       ORDER BY b.created_at DESC`, [customerId]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};