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