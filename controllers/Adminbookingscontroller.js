const db = require("../config/db");

exports.getAllBookings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         b.id, b.status, b.total_price, b.location,
         DATE_FORMAT(b.scheduled_date, '%b %d, %Y') AS scheduled_date,
         b.scheduled_time,
         u_c.full_name AS customer_name,
         u_p.full_name AS provider_name,
         s.name        AS service_name,
         DATE_FORMAT(b.created_at, '%b %d, %Y') AS created_at
       FROM bookings b
       JOIN users u_c    ON u_c.id = b.customer_id
       JOIN users u_p    ON u_p.id = b.provider_id
       JOIN services s   ON s.id   = b.service_id
       ORDER BY b.created_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};