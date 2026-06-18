const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../config/db");
const { sendOtpEmail, sendResetEmail } = require("../utils/emailService");

// ─────────────────────────────────────────────────────────
// Helper: 6-digit OTP
// ─────────────────────────────────────────────────────────
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─────────────────────────────────────────────────────────
// 1. SEND OTP (Registration ke liye)
// POST /api/auth/send-otp
// Body: { email, full_name }
// ─────────────────────────────────────────────────────────
const sendOtp = async (req, res) => {
  try {
    const { email, full_name } = req.body;
    if (!email || !full_name)
      return res.status(400).json({ success: false, message: "Email and name required" });

    // Check email already registered nahi ho
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(409).json({ success: false, message: "Email already registered" });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Pehle purana OTP delete karo agar tha
    await db.query("DELETE FROM email_otps WHERE email = ?", [email]);

    // Naya OTP save karo
    await db.query(
      "INSERT INTO email_otps (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );

    await sendOtpEmail(email, full_name, otp);

    console.log("OTP:", otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email"
    });
  } catch (err) {
    console.error("sendOtp error:", err);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// ─────────────────────────────────────────────────────────
// 2. VERIFY OTP
// POST /api/auth/verify-otp
// Body: { email, otp }
// ─────────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email and OTP required" });

    const [rows] = await db.query(
      "SELECT * FROM email_otps WHERE email = ? AND otp = ? ORDER BY created_at DESC LIMIT 1",
      [email, otp]
    );

    if (rows.length === 0)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    const record = rows[0];
    if (new Date() > new Date(record.expires_at))
      return res.status(400).json({ success: false, message: "OTP expired. Request a new one." });

    // OTP verified — delete karo
    await db.query("DELETE FROM email_otps WHERE email = ?", [email]);

    return res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
// 3. FORGOT PASSWORD — Reset link bhejna
// POST /api/auth/forgot-password
// Body: { email }
// ─────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    const [rows] = await db.query(
      "SELECT id, full_name, role FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    // Security: even if not found, same response
    if (rows.length === 0)
      return res.status(200).json({ success: true, message: "If this email exists, a reset link has been sent." });

    const user = rows[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Pehle purana token delete karo
    await db.query("DELETE FROM password_resets WHERE email = ?", [email]);

    // Token save karo
    await db.query(
      "INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)",
      [email, resetToken, expiresAt]
    );

    await sendResetEmail(email, user.full_name, resetToken, user.role);

    return res.status(200).json({ success: true, message: "If this email exists, a reset link has been sent." });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ success: false, message: "Failed to send reset email" });
  }
};

// ─────────────────────────────────────────────────────────
// 4. RESET PASSWORD — Token verify karke password change
// POST /api/auth/reset-password
// Body: { token, new_password }
// ─────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password)
      return res.status(400).json({ success: false, message: "Token and new password required" });

    if (new_password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const [rows] = await db.query(
      "SELECT * FROM password_resets WHERE token = ? LIMIT 1",
      [token]
    );

    if (rows.length === 0)
      return res.status(400).json({ success: false, message: "Invalid or expired reset link" });

    const record = rows[0];
    if (new Date() > new Date(record.expires_at))
      return res.status(400).json({ success: false, message: "Reset link expired. Please request a new one." });

    const hashed = await bcrypt.hash(new_password, 12);

    await db.query("UPDATE users SET password = ? WHERE email = ?", [hashed, record.email]);

    // Token delete karo
    await db.query("DELETE FROM password_resets WHERE token = ?", [token]);

    return res.status(200).json({ success: true, message: "Password reset successfully. Please login." });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
// 5. VERIFY RESET TOKEN (Flutter app token check karey)
// GET /api/auth/verify-reset-token?token=xxx
// ─────────────────────────────────────────────────────────
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.status(400).json({ success: false, message: "Token required" });

    const [rows] = await db.query(
      "SELECT * FROM password_resets WHERE token = ? LIMIT 1",
      [token]
    );

    if (rows.length === 0)
      return res.status(400).json({ success: false, valid: false, message: "Invalid token" });

    if (new Date() > new Date(rows[0].expires_at))
      return res.status(400).json({ success: false, valid: false, message: "Token expired" });

    return res.status(200).json({ success: true, valid: true, email: rows[0].email });
  } catch (err) {
    //console.error("verifyResetToken error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { sendOtp, verifyOtp, forgotPassword, resetPassword, verifyResetToken };
