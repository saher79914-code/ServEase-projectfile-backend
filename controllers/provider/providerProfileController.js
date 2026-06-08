const db = require("../../config/db");

// GET profile
exports.getProfile = async (req, res) => {
  const pid = parseInt(req.query.provider_id);
  try {
    const [[data]] = await db.query(
      `SELECT u.full_name, u.phone, u.email, u.address, u.profile_image,
              p.bio, p.years_of_experience, p.approval_status, p.rating,
              s.name AS service_name, s.price AS hourly_rate,
              (SELECT COUNT(*) FROM bookings WHERE provider_id = u.id AND status = 'completed') AS jobs_done
       FROM provider_profiles p
       JOIN users u ON u.id = p.user_id
       JOIN services s ON s.id = p.service_id
       WHERE p.user_id = ?`, [pid]);

    if (!data) return res.status(404).json({ message: "Provider not found" });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT update profile
exports.updateProfile = async (req, res) => {
  const pid = parseInt(req.query.provider_id);
  const { full_name, phone, address, bio, hourly_rate } = req.body;
  try {
    await db.query(
      `UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?`,
      [full_name, phone, address, pid]);
    await db.query(
      `UPDATE provider_profiles SET bio = ? WHERE user_id = ?`,
      [bio, pid]);
    await db.query(
      `UPDATE services SET price = ? WHERE id = (SELECT service_id FROM provider_profiles WHERE user_id = ?)`,
      [hourly_rate, pid]);
    res.json({ message: "Profile updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET notifications
exports.getNotifications = async (req, res) => {
  const pid = parseInt(req.query.provider_id);
  try {
    const [rows] = await db.query(
      `SELECT id, title, message, type, is_read,
              DATE_FORMAT(created_at, '%b %d') AS date,
              TIMESTAMPDIFF(MINUTE, created_at, NOW()) AS minutes_ago
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 20`, [pid]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};