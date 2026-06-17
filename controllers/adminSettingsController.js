const db = require("../config/db");

// ─────────────────────────────────────────────────────────
// GET Admin Settings
// GET /api/admin/settings
// ─────────────────────────────────────────────────────────
const getSettings = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM app_settings LIMIT 1");
    if (rows.length === 0) {
      // Default settings return karo
      return res.status(200).json({
        success: true,
        settings: {
          commission_rate: 10,
          security_deposit_amount: 2000,
          security_deposit_required: true,
          app_name: "ServEase",
          support_email: "adminservease@gmail.com",
          support_phone: "",
          terms_and_conditions: "",
          notify_new_booking: true,
          notify_new_registration: true,
          notify_complaint: true,
        },
      });
    }
    return res.status(200).json({ success: true, settings: rows[0] });
  } catch (err) {
    console.error("getSettings error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
// UPDATE Admin Settings
// PUT /api/admin/settings
// ─────────────────────────────────────────────────────────
const updateSettings = async (req, res) => {
  try {
    const {
      commission_rate,
      security_deposit_amount,
      security_deposit_required,
      app_name,
      support_email,
      support_phone,
      terms_and_conditions,
      notify_new_booking,
      notify_new_registration,
      notify_complaint,
    } = req.body;

    const [existing] = await db.query("SELECT id FROM app_settings LIMIT 1");

    if (existing.length === 0) {
      await db.query(
        `INSERT INTO app_settings 
         (commission_rate, security_deposit_amount, security_deposit_required,
          app_name, support_email, support_phone, terms_and_conditions,
          notify_new_booking, notify_new_registration, notify_complaint)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          commission_rate ?? 10,
          security_deposit_amount ?? 2000,
          security_deposit_required ?? true,
          app_name ?? "ServEase",
          support_email ?? "adminservease@gmail.com",
          support_phone ?? "",
          terms_and_conditions ?? "",
          notify_new_booking ?? true,
          notify_new_registration ?? true,
          notify_complaint ?? true,
        ]
      );
    } else {
      await db.query(
        `UPDATE app_settings SET
          commission_rate = COALESCE(?, commission_rate),
          security_deposit_amount = COALESCE(?, security_deposit_amount),
          security_deposit_required = COALESCE(?, security_deposit_required),
          app_name = COALESCE(?, app_name),
          support_email = COALESCE(?, support_email),
          support_phone = COALESCE(?, support_phone),
          terms_and_conditions = COALESCE(?, terms_and_conditions),
          notify_new_booking = COALESCE(?, notify_new_booking),
          notify_new_registration = COALESCE(?, notify_new_registration),
          notify_complaint = COALESCE(?, notify_complaint)
        WHERE id = ?`,
        [
          commission_rate,
          security_deposit_amount,
          security_deposit_required,
          app_name,
          support_email,
          support_phone,
          terms_and_conditions,
          notify_new_booking,
          notify_new_registration,
          notify_complaint,
          existing[0].id,
        ]
      );
    }

    return res.status(200).json({ success: true, message: "Settings updated successfully" });
  } catch (err) {
    console.error("updateSettings error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getSettings, updateSettings };
