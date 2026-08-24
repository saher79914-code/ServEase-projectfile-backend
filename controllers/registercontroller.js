const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_EXPIRES_IN = "7d"; // Token valid for 7 days

// ── Helper: Generate Token ─────────────────────────────────────────
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ── Helper: Send Token Response ────────────────────────────────────
const sendTokenResponse = (res, statusCode, user, role) => {
  const token = generateToken(user.id, role);
  res.status(statusCode).json({ success: true, token, role, user });
};

// ═══════════════════════════════════════════════════════════════════
// REGISTER CUSTOMER
// ═══════════════════════════════════════════════════════════════════
const registerCustomer = async (req, res) => {
  try {
    const { full_name, email, phone, cnic, address, password } = req.body;

    if (!full_name || !email || !phone || !cnic || !address || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (!/^[\w\-.]+@([\w\-]+\.)+[\w]{2,4}$/.test(email))
      return res.status(400).json({ success: false, message: "Enter a valid email" });

    if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic))
      return res.status(400).json({ success: false, message: "CNIC format: XXXXX-XXXXXXX-X" });

    if (password.length < 8)
      return res.status(400).json({ success: false, message: "Password min 8 characters" });

    const [byEmail] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (byEmail.length > 0)
      return res.status(409).json({ success: false, message: "Email already registered" });

    const [byCnic] = await db.query("SELECT id FROM users WHERE cnic = ?", [cnic]);
    if (byCnic.length > 0)
      return res.status(409).json({ success: false, message: "CNIC already registered" });

    const hashed = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      `INSERT INTO users (full_name, email, phone, cnic, address, password, role)
       VALUES (?, ?, ?, ?, ?, ?, 'customer')`,
      [full_name, email, phone, cnic, address, hashed]
    );

    // Admin ko notify karo
    try {
      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         SELECT id, 'admin', 'New Customer Registered',
                CONCAT('New customer signed up: ', ?), 'admin', 0
         FROM users WHERE role = 'admin' LIMIT 1`,
        [full_name]
      );
    } catch (e) { console.error('Notif error:', e.message); }

    const user = { id: result.insertId, full_name, email, phone, cnic, address, role: "customer" };
    return sendTokenResponse(res, 201, user, "customer");

  } catch (err) {
    console.error("registerCustomer error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════
// REGISTER PROVIDER — with CNIC front/back images
// ═══════════════════════════════════════════════════════════════════
const registerProvider = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      cnic,
      address,
      password,
      category,
      service_name,
      years_of_experience,
      bio,
    } = req.body;

    // Validation
    if (!full_name || !email || !phone || !cnic || !address || !password || !service_name)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (!/^[\w\-.]+@([\w\-]+\.)+[\w]{2,4}$/.test(email))
      return res.status(400).json({ success: false, message: "Enter a valid email" });

    if (password.length < 8)
      return res.status(400).json({ success: false, message: "Password min 8 characters" });

    // CNIC images — req.files (multer.fields) or req.body string fallback
    const cnicFront = req.files?.cnic_front?.[0];
    const cnicBack = req.files?.cnic_back?.[0];

    const cnicFrontPath = cnicFront
      ? `/uploads/cnic/${cnicFront.filename}`
      : (req.body.cnic_front || "/uploads/cnic/default_front.jpg");
    const cnicBackPath = cnicBack
      ? `/uploads/cnic/${cnicBack.filename}`
      : (req.body.cnic_back || "/uploads/cnic/default_back.jpg");

    // Find service id — NULL if custom or not found
    let service_id = null;
    if (service_name && service_name !== "Other — Specify Below" && service_name !== "Other") {
      const [serviceRows] = await db.query(
        `SELECT id FROM services WHERE name = ? LIMIT 1`,
        [service_name]
      );
      if (serviceRows.length > 0) {
        service_id = serviceRows[0].id;
      }
    }

    const [byEmail] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (byEmail.length > 0)
      return res.status(409).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);

    const [userResult] = await db.query(
      `INSERT INTO users (full_name, email, phone, cnic, address, password, role)
       VALUES (?, ?, ?, ?, ?, ?, 'provider')`,
      [full_name, email, phone, cnic, address, hashed]
    );

    const userId = userResult.insertId;

    await db.query(
      `INSERT INTO provider_profiles
       (user_id, service_id, years_of_experience, bio, cnic_front_image, cnic_back_image, approval_status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, service_id, years_of_experience ?? 0, bio ?? null, cnicFrontPath, cnicBackPath]
    );

    // Admin ko notify karo
    try {
      await db.query(
        `INSERT INTO notifications (user_id, role, title, message, type, is_read)
         SELECT id, 'admin', 'New Provider Registered',
                CONCAT('New provider registered: ', ?, ' — Service: ', ?), 'admin', 0
         FROM users WHERE role = 'admin' LIMIT 1`,
        [full_name, service_name]
      );
    } catch (e) { console.error('Notif error:', e.message); }

    return res.status(201).json({
      success: true,
      message: "Provider registered successfully. Waiting for admin approval.",
      user_id: userId
    });

  } catch (err) {
    console.error("registerProvider error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════
// REGISTER ADMIN
// ═══════════════════════════════════════════════════════════════════
const registerAdmin = async (req, res) => {
  try {
    const { full_name, email, password, master_key } = req.body;

    const ADMIN_MASTER_KEY = process.env.ADMIN_MASTER_KEY || "servease123";
    if (!master_key || master_key !== ADMIN_MASTER_KEY)
      return res.status(403).json({ success: false, message: "Forbidden: invalid master key" });

    if (!full_name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields required" });

    if (password.length < 8)
      return res.status(400).json({ success: false, message: "Admin password min 8 characters" });

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(409).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      `INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, 'admin')`,
      [full_name, email, hashed]
    );

    const user = { id: result.insertId, full_name, email, role: "admin" };
    return sendTokenResponse(res, 201, user, "admin");

  } catch (err) {
    console.error("registerAdmin error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);

    if (rows.length === 0)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    // ── Provider approval check ──
    if (user.role === "provider") {
      const [[profile]] = await db.query(
        `SELECT approval_status FROM provider_profiles WHERE user_id = ?`, [user.id]
      );

      if (!profile || profile.approval_status === 'pending') {
        return res.status(403).json({
          success: false,
          message: "Your account is pending admin approval"
        });
      }

      if (profile.approval_status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: "Your provider account was rejected by admin"
        });
      }
    }

    // ── Blocked user check ──
    if (user.is_blocked == 1)
      return res.status(403).json({ success: false, message: "Your account has been blocked" });

    const { password: _pwd, ...safeUser } = user;
    return sendTokenResponse(res, 200, safeUser, user.role);

  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════
// GET ME
// ═══════════════════════════════════════════════════════════════════
const getMe = async (req, res) => {
  try {
    const { id, role } = req.user;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE id = ? AND role = ? LIMIT 1",
      [id, role]
    );

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "User not found" });

    const user = rows[0];
    delete user.password;
    return res.status(200).json({ success: true, role, user });

  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { registerCustomer, registerProvider, registerAdmin, login, getMe };