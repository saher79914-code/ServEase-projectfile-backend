const db = require("../config/db");

// GET ALL SERVICES
exports.getServices = async (req, res) => {
  try {
    const [services] = await db.query(`
      SELECT
        s.*,
        COUNT(DISTINCT pp.user_id) AS provider_count,
        COUNT(DISTINCT b.customer_id) AS customer_count
      FROM services s
      LEFT JOIN provider_profiles pp ON s.id = pp.service_id
      LEFT JOIN bookings b ON s.id = b.service_id
      GROUP BY s.id
      ORDER BY s.id DESC
    `);

    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET SINGLE SERVICE
exports.getServiceById = async (req, res) => {
  try {
    const id = req.params.id;

    // Service info
    const [[service]] = await db.query(
      `SELECT * FROM services WHERE id = ?`, [id]
    );
    if (!service) return res.status(404).json({ success: false, message: "Service Not Found" });

    // Stats
    const [[{ provider_count }]] = await db.query(
      `SELECT COUNT(*) AS provider_count FROM provider_profiles WHERE service_id = ?`, [id]
    );
    const [[{ customer_count }]] = await db.query(
      `SELECT COUNT(DISTINCT customer_id) AS customer_count FROM bookings WHERE service_id = ?`, [id]
    );
    const [[{ total_bookings }]] = await db.query(
      `SELECT COUNT(*) AS total_bookings FROM bookings WHERE service_id = ?`, [id]
    );
    const [[{ avg_rating }]] = await db.query(
      `SELECT COALESCE(AVG(p.rating), 0) AS avg_rating FROM provider_profiles p WHERE p.service_id = ?`, [id]
    );

    // Providers list
    const [providers] = await db.query(
      `SELECT 
         u.id, u.full_name AS name, u.phone,
         p.rating, p.created_at AS joined_date,
         COUNT(b.id) AS jobs_done,
         CASE WHEN SUM(CASE WHEN b.status = 'accepted' THEN 1 ELSE 0 END) > 0 
              THEN 0 ELSE 1 END AS is_available
       FROM provider_profiles p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN bookings b ON b.provider_id = u.id
       WHERE p.service_id = ?
       GROUP BY u.id, u.full_name, u.phone, p.rating, p.created_at`,
      [id]
    );

    // Customers list
    const [customers] = await db.query(
      `SELECT 
         u.id, u.full_name AS name, u.phone,
         COUNT(b.id) AS total_bookings,
         MAX(b.created_at) AS last_booking
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       WHERE b.service_id = ?
       GROUP BY u.id, u.full_name, u.phone`,
      [id]
    );

    res.status(200).json({
      service_id:     service.id,
      service_name:   service.name,
      service_icon:   service.icon ?? '🔧',
      category:       service.category,
      price:          service.price,
      is_active:      service.is_active,
      provider_count,
      customer_count,
      total_bookings,
      avg_rating,
      providers: providers.map(p => ({
        id:           p.id,
        name:         p.name,
        phone:        p.phone,
        rating:       parseFloat(p.rating),
        jobs_done:    p.jobs_done,
        is_available: p.is_available,
        joined_date:  new Date(p.joined_date).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' }),
      })),
      customers: customers.map(c => ({
        id:             c.id,
        name:           c.name,
        phone:          c.phone,
        total_bookings: c.total_bookings,
        last_booking:   new Date(c.last_booking).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }),
      })),
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// CREATE SERVICE
exports.createService = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      icon,
      is_active,
    } = req.body;

    const [result] = await db.query(
      `
      INSERT INTO services
      (
        name,
        description,
        price,
        category,
        icon,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        description,
        price,
        category,
        icon,
        is_active,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Service Created",
      id: result.insertId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// UPDATE SERVICE
exports.updateService = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      name,
      description,
      price,
      category,
      icon,
      is_active,
    } = req.body;

    await db.query(
      `
      UPDATE services
      SET
      name = ?,
      description = ?,
      price = ?,
      category = ?,
      icon = ?,
      is_active = ?
      WHERE id = ?
      `,
      [
        name,
        description,
        price,
        category,
        icon,
        is_active,
        id,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Service Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// TOGGLE ACTIVE
exports.toggleService = async (req, res) => {
  try {
    const id = req.params.id;

    const { is_active } = req.body;

    await db.query(
      `
      UPDATE services
      SET is_active = ?
      WHERE id = ?
      `,
      [is_active, id]
    );

    res.status(200).json({
      success: true,
      message: "Status Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// DELETE SERVICE
// DELETE SERVICE
exports.deleteService = async (req, res) => {
  try {

    const id = req.params.id;

    // Check provider_profiles
    const [providers] = await db.query(
      `
      SELECT user_id
      FROM provider_profiles
      WHERE service_id = ?
      `,
      [id]
    );

    if (providers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This service is assigned to providers and cannot be deleted"
      });
    }

    const [result] = await db.query(
      `
      DELETE FROM services
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Service Not Found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Service Deleted"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};