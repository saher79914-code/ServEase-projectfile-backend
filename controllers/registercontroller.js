const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_EXPIRES_IN = "7d";

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
// POST /auth/register/customer
// ═══════════════════════════════════════════════════════════════════
const registerCustomer = async (req, res) => {
  try {
    const { full_name, email, phone, cnic, address, password } = req.body;
    console.log("registerCustomer called with:", req.body);

    if (!full_name || !email || !phone || !cnic || !address || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (!/^[\w\-.]+@([\w\-]+\.)+[\w]{2,4}$/.test(email))
      return res.status(400).json({ success: false, message: "Enter a valid email" });

    if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic))
      return res.status(400).json({ success: false, message: "CNIC format: XXXXX-XXXXXXX-X" });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password min 6 characters" });

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

    const user = { id: result.insertId, full_name, email, phone, cnic, address, role: "customer" };
    return sendTokenResponse(res, 201, user, "customer");

  } catch (err) {
    console.error("registerCustomer error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════
// REGISTER PROVIDER
// POST /auth/register/provider
// Single users table — sab kuch yahan save hoga
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
      service_id,
      years_of_experience,
      bio,
    } = req.body;

    console.log("registerProvider called with:", req.body);

    // ── Validation ─────────────────────────────────────────────────
    if (!full_name || !email || !phone || !cnic || !address || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (!/^[\w\-.]+@([\w\-]+\.)+[\w]{2,4}$/.test(email))
      return res.status(400).json({ success: false, message: "Enter a valid email" });

    if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic))
      return res.status(400).json({ success: false, message: "CNIC format: XXXXX-XXXXXXX-X" });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password min 6 characters" });

    // ── Check duplicate email / CNIC ───────────────────────────────
    const [existing] = await db.query(
      `SELECT id FROM users WHERE email = ? OR cnic = ? LIMIT 1`,
      [email, cnic]
    );
    if (existing.length > 0)
      return res.status(409).json({ success: false, message: "Email or CNIC already registered" });

    // ── Hash password ──────────────────────────────────────────────
    const hashed = await bcrypt.hash(password, 12);

    // ── Insert into users ──────────────────────────────────────────
    const [userResult] = await db.query(
      `INSERT INTO users
        (full_name, email, phone, cnic, address, password, role)
       VALUES (?, ?, ?, ?, ?, ?, 'provider')`,
      [full_name, email, phone, cnic, address, hashed]
    );

    const userId = userResult.insertId;

    // ── Insert into provider_profiles ─────────────────────────────
    await db.query(
      `INSERT INTO provider_profiles
        (user_id, service_id, years_of_experience, bio)
       VALUES (?, ?, ?, ?)`,
      [userId, service_id ?? null, years_of_experience ?? 0, bio ?? null]
    );

    return res.status(201).json({
      success: true,
      message: "Provider registered successfully. Awaiting admin approval.",
      data: {
        id: userId,
        full_name,
        email,
        role: "provider",
        approval_status: "pending",
      },
    });

  } catch (err) {
    console.error("registerProvider error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════
// REGISTER ADMIN
// POST /auth/register/admin
// ═══════════════════════════════════════════════════════════════════
const registerAdmin = async (req, res) => {
  try {
    const { full_name, email, password, master_key } = req.body;

    if (!master_key || master_key !== "servease123")
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
// LOGIN — single endpoint for all roles
// POST /auth/login
// Body: { email, password }  — role auto-detect from DB
// ═══════════════════════════════════════════════════════════════════
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const user = rows[0];

    // ── Password check ─────────────────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

   // ── Provider approval check ────────────────────────────────────
    //is_approved: 0=Pending, 2=Approved, 3=Rejected
    if (user.role === "provider" && user.is_approved !== 2) 

    // ── Blocked user check ─────────────────────────────────────────
    if (user.is_blocked == 1)
      return res.status(403).json({ success: false, message: "Your account has been blocked" });

    // ── Remove password before sending ────────────────────────────
    const { password: _pwd, ...safeUser } = user;

    return sendTokenResponse(res, 200, safeUser, user.role);

  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════
// GET ME — from JWT token
// GET /auth/me
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