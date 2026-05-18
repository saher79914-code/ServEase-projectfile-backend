const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_EXPIRES_IN = "7d";
// ── Helper: Generate Token ─────────────────────────────────
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ── Helper: Send Token Response ────────────────────────────
const sendTokenResponse = (res, statusCode, user, role) => {
  const token = generateToken(user.id, role);
  res.status(statusCode).json({ success: true, token, role, user });
};

// ── REGISTER CUSTOMER ──────────────────────────────────────
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

// ── REGISTER PROVIDER ──────────────────────────────────────
const registerProvider = async (req, res) => {
  try {
    const { full_name, email, phone, cnic, address, password, category, years_of_experience, bio } = req.body;

    if (!full_name || !email || !phone || !cnic || !address || !password || !category || years_of_experience === undefined || !bio)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (!/^[\w\-.]+@([\w\-]+\.)+[\w]{2,4}$/.test(email))
      return res.status(400).json({ success: false, message: "Enter a valid email" });

    if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic))
      return res.status(400).json({ success: false, message: "CNIC format: XXXXX-XXXXXXX-X" });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password min 6 characters" });

    const allowed = ["Crafts", "Fashion", "Education", "Cleaning", "Beauty", "Other"];
    if (!allowed.includes(category))
      return res.status(400).json({ success: false, message: "Invalid category" });

    const years = parseInt(years_of_experience);
    if (isNaN(years) || years < 0)
      return res.status(400).json({ success: false, message: "Invalid years of experience" });

    const [byEmail] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (byEmail.length > 0)
      return res.status(409).json({ success: false, message: "Email already registered" });

    const [byCnic] = await db.query("SELECT id FROM users WHERE cnic = ?", [cnic]);
    if (byCnic.length > 0)
      return res.status(409).json({ success: false, message: "CNIC already registered" });

    const hashed = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      `INSERT INTO users
        (full_name, email, phone, cnic, address, password, role, category, years_of_experience, bio, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, 'provider', ?, ?, ?, 0)`,
      [full_name, email, phone, cnic, address, hashed, category, years, bio]
    );

    const user = {
      id: result.insertId, full_name, email, phone, cnic, address,
      role: "provider", category, years_of_experience: years, bio, is_approved: false,
    };
    return sendTokenResponse(res, 201, user, "provider");

  } catch (err) {
    console.error("registerProvider error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── REGISTER ADMIN ─────────────────────────────────────────
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

// ── LOGIN ──────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Provider approval check
    if (user.role === "provider" && !user.is_approved == 2) {
      return res.status(403).json({
        success: false,
        message: "Account pending admin approval",
      });
    }

    const { password: pwd, ...safeUser } = user;

    return sendTokenResponse(res, 200, safeUser, user.role);

  } catch (err) {
    console.error("login error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ── GET ME ─────────────────────────────────────────────────
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

// ── EXPORTS ────────────────────────────────────────────────
module.exports = { registerCustomer, registerProvider, registerAdmin, login, getMe };