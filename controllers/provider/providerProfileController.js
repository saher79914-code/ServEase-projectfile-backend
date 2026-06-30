const db = require("../../config/db");
console.log("db in controller:", typeof db, db ? typeof db.query : "null");

// GET profile
exports.getProfile = async (req, res) => {
  const db = require("../../config/db");
  const pid = req.user ? req.user.id : parseInt(req.query.provider_id);
  try {
    const [[data]] = await db.query(
      `SELECT u.full_name, u.phone, u.email, u.address, u.profile_image,
              p.bio, p.years_of_experience, p.approval_status, p.rating,
              s.name AS service_name, p.hourly_rate,
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
  const db = require("../../config/db");
  const pid = req.user ? req.user.id : parseInt(req.query.provider_id);
  const { full_name, phone, address, bio, hourly_rate } = req.body;
  
  let profileImagePath = null;
  if (req.file) {
    profileImagePath = `/uploads/profile/${req.file.filename}`;
  }

  try {
    if (profileImagePath) {
      await db.query(
        `UPDATE users SET full_name = ?, phone = ?, address = ?, profile_image = ? WHERE id = ?`,
        [full_name, phone, address, profileImagePath, pid]);
    } else {
      await db.query(
        `UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?`,
        [full_name, phone, address, pid]);
    }
    
    await db.query(
      `UPDATE provider_profiles SET bio = ?, hourly_rate = ? WHERE user_id = ?`,
      [bio, hourly_rate, pid]);
      
    res.json({ message: "Profile updated", profile_image: profileImagePath });
  } catch (err) { res.status(500).json({ message: err.message, stack: err.stack }); }
};

// GET provider reviews
exports.getReviews = async (req, res) => {
  const db = require("../../config/db");
  const pid = req.user ? req.user.id : parseInt(req.query.provider_id);
  try {
    const [rows] = await db.query(
      `SELECT r.rating, r.note, DATE_FORMAT(r.created_at, '%b %d, %Y') AS date,
              u.full_name AS customer_name, u.profile_image AS customer_image
       FROM ratings r
       JOIN users u ON u.id = r.customer_id
       WHERE r.provider_id = ?
       ORDER BY r.created_at DESC`, [pid]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT change password
exports.changePassword = async (req, res) => {
  const db = require("../../config/db");
  const userId = req.user ? req.user.id : parseInt(req.body.provider_id);
  const { current_password, new_password } = req.body;
  const bcrypt = require("bcryptjs");
  try {
    const [[user]] = await db.query(`SELECT password FROM users WHERE id = ?`, [userId]);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
    
    const hashed = await bcrypt.hash(new_password, 12);
    await db.query(`UPDATE users SET password = ? WHERE id = ?`, [hashed, userId]);
    res.json({ message: "Password changed successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

