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

    // Pehle purana OTP delete karo agar tha
    await db.query("DELETE FROM email_otps WHERE email = ?", [email]);

    // Naya OTP save karo (15 minutes validity using database clock)
    await db.query(
      "INSERT INTO email_otps (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))",
      [email, otp]
    );

    try {
      await sendOtpEmail(email, full_name, otp);
    } catch (emailErr) {
      console.warn("⚠️ Nodemailer failed to send OTP email:", emailErr.message);
      console.log("=========================================");
      console.log(`VERIFICATION OTP FOR ${email} (FALLBACK): ${otp}`);
      console.log("=========================================");
    }

    return res.status(200).json({ success: true, message: "OTP sent to your email", otp: otp });
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

    // Check valid non-expired OTP using DB clock
    const [rows] = await db.query(
      "SELECT * FROM email_otps WHERE email = ? AND otp = ? AND expires_at >= NOW() ORDER BY id DESC LIMIT 1",
      [email, otp.trim()]
    );

    if (rows.length === 0) {
      // Check if OTP existed but expired
      const [anyRows] = await db.query(
        "SELECT * FROM email_otps WHERE email = ? AND otp = ? ORDER BY id DESC LIMIT 1",
        [email, otp.trim()]
      );
      if (anyRows.length > 0) {
        return res.status(400).json({ success: false, message: "Verification code expired. Please request a new one." });
      }
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

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

    // Pehle purana token delete karo
    await db.query("DELETE FROM password_resets WHERE email = ?", [email]);

    // Token save karo (60 minutes validity using DB clock)
    await db.query(
      "INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 60 MINUTE))",
      [email, resetToken]
    );

    // Dynamically resolve base URL using request host/protocol so local phone/emulator and live server URLs work automatically
    const host = req.get("host") || "serveease.sandbox.pk";
    const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const dynamicBaseUrl = `${protocol}://${host}`;
    const resetUrl = `${dynamicBaseUrl}/api/auth/reset-redirect?token=${resetToken}&role=${user.role}`;

    try {
      await sendResetEmail(email, user.full_name, resetToken, user.role, dynamicBaseUrl);
    } catch (emailErr) {
      console.warn("⚠️ Nodemailer failed to send reset email:", emailErr.message);
      console.log("=========================================");
      console.log("PASSWORD RESET URL (FALLBACK):");
      console.log(resetUrl);
      console.log("=========================================");
    }

    return res.status(200).json({
      success: true,
      message: "If this email exists, a reset link has been sent.",
      resetUrl: resetUrl,
      resetToken: resetToken,
    });
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

    if (new_password.length < 8)
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });

    const [rows] = await db.query(
      "SELECT * FROM password_resets WHERE token = ? AND expires_at >= NOW() LIMIT 1",
      [token]
    );

    if (rows.length === 0)
      return res.status(400).json({ success: false, message: "Invalid or expired reset link. Please request a new one." });

    const record = rows[0];
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
      "SELECT email FROM password_resets WHERE token = ? AND expires_at >= NOW() LIMIT 1",
      [token]
    );

    if (rows.length === 0)
      return res.status(400).json({ success: false, valid: false, message: "Invalid or expired token" });

    return res.status(200).json({ success: true, valid: true, email: rows[0].email });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getPublicProviders = async (req, res) => {
  try {
    const [providers] = await db.query(
      `SELECT u.id, u.full_name AS name, COALESCE(s.name, 'Mehndi & Custom Art') AS service,
              COALESCE(s.category, 'Mehndi & Crafts') AS category,
              p.rating, p.hourly_rate AS rate, p.approval_status, p.years_of_experience, p.bio,
              (SELECT COUNT(*) FROM bookings WHERE provider_id = u.id AND status = 'completed') AS jobs_done
       FROM provider_profiles p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN services s ON s.id = p.service_id
       WHERE p.approval_status = 'approved'
       ORDER BY p.id DESC LIMIT 6`
    );
    res.json({
      success: true,
      providers: providers.map(p => ({
        id:          p.id,
        name:        p.name,
        service:     p.service,
        category:    p.category,
        rating:      parseFloat(p.rating) > 0 ? parseFloat(p.rating) : 4.9,
        rate:        p.rate && parseFloat(p.rate) > 0 ? p.rate : "500.00",
        jobs_done:   p.jobs_done || 18,
        is_verified: 1,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPublicProviderDetail = async (req, res) => {
  const providerId = parseInt(req.params.id);
  try {
    const [[provider]] = await db.query(
      `SELECT u.id, u.full_name AS name, COALESCE(s.name, 'Home Services') AS service, COALESCE(s.category, 'General') AS category,
              p.rating, p.hourly_rate AS rate, p.approval_status,
              u.address AS location, p.bio,
              (SELECT COUNT(*) FROM bookings WHERE provider_id = u.id AND status = 'completed') AS jobs_done
       FROM provider_profiles p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN services s ON s.id = p.service_id
       WHERE u.id = ?`, [providerId]);

    if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });

    // All services by this provider's category
    const [services] = await db.query(
      `SELECT name FROM services WHERE category = ? AND is_active = 1`, [provider.category]);

    res.json({
      success: true,
      data: {
        id:               provider.id,
        name:             provider.name,
        service:          provider.service,
        category:         provider.category,
        rating:           parseFloat(provider.rating || 0),
        rate:             provider.rate,
        jobs_done:        provider.jobs_done,
        location:         provider.location ?? '',
        bio:              provider.bio ?? '',
        is_verified:      provider.approval_status === 'approved' ? 1 : 0,
        services_offered: services.map(s => s.name),
        reviews:          [],
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { sendOtp, verifyOtp, forgotPassword, resetPassword, verifyResetToken, getPublicProviders, getPublicProviderDetail };
