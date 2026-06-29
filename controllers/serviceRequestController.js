const db = require("../config/db");
const { sendApprovalEmail, sendRejectionEmail } = require("../utils/emailService");

// ─────────────────────────────────────────────────────────
// PROVIDER — Submit Custom Service Request
// POST /api/auth/service-request
// ─────────────────────────────────────────────────────────
const submitServiceRequest = async (req, res) => {
  try {
    const {
      provider_id,
      provider_name,
      provider_email,
      service_name,
      category,
      custom_category,
      description,
      years_of_experience,
    } = req.body;

    if (!service_name || !category)
      return res.status(400).json({ success: false, message: "Service name and category required" });

    await db.query(
      `INSERT INTO service_requests 
       (provider_id, provider_name, provider_email, service_name, category, custom_category, description, years_of_experience)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        provider_id || 0,
        provider_name || "",
        provider_email || "",
        service_name,
        category,
        custom_category || null,
        description || "",
        years_of_experience || 0,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Service request submitted. Admin will review and approve it.",
    });
  } catch (err) {
    console.error("submitServiceRequest error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
// ADMIN — Get All Service Requests
// GET /api/admin/service-requests?status=pending
// ─────────────────────────────────────────────────────────
const getServiceRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = "SELECT * FROM service_requests";
    const params = [];

    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await db.query(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error("getServiceRequests error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
// ADMIN — Approve Service Request
// PUT /api/admin/service-requests/:id/approve
// ─────────────────────────────────────────────────────────
const approveServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note, price, icon } = req.body;

    const [[request]] = await db.query(
      "SELECT * FROM service_requests WHERE id = ?",
      [id]
    );
    if (!request)
      return res.status(404).json({ success: false, message: "Request not found" });

    // Service database mein add karo
    await db.query(
      `INSERT INTO services (name, category, price, icon, is_active) VALUES (?, ?, ?, ?, 1)`,
      [
        request.service_name,
        request.custom_category || request.category,
        price || 0,
        icon || "🔧",
      ]
    );

    // Request status update karo
    await db.query(
      "UPDATE service_requests SET status = 'approved', admin_note = ? WHERE id = ?",
      [admin_note || "Approved", id]
    );

    // Provider ko notification send karo (agar email hai)
    if (request.provider_email) {
      try {
        await sendApprovalEmail(
          request.provider_email,
          request.provider_name || "Provider",
          request.service_name
        );
      } catch (e) {
        // Email fail ho to ignore karo
      }
    }

    return res.status(200).json({
      success: true,
      message: "Service approved and added successfully",
    });
  } catch (err) {
    console.error("approveServiceRequest error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
// ADMIN — Reject Service Request
// PUT /api/admin/service-requests/:id/reject
// ─────────────────────────────────────────────────────────
const rejectServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;

    const [[request]] = await db.query(
      "SELECT * FROM service_requests WHERE id = ?",
      [id]
    );
    if (!request)
      return res.status(404).json({ success: false, message: "Request not found" });

    await db.query(
      "UPDATE service_requests SET status = 'rejected', admin_note = ? WHERE id = ?",
      [admin_note || "Rejected", id]
    );

    if (request.provider_email) {
      try {
        await sendRejectionEmail(
          request.provider_email,
          request.provider_name || "Provider",
          request.service_name,
          admin_note || "Rejected"
        );
      } catch (e) {
        // Email fail ho to ignore karo
      }
    }

    return res.status(200).json({ success: true, message: "Service request rejected" });
  } catch (err) {
    console.error("rejectServiceRequest error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
// ADMIN — Get Pending Count (for badge)
// GET /api/admin/service-requests/pending-count
// ─────────────────────────────────────────────────────────
const getPendingCount = async (req, res) => {
  try {
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) as count FROM service_requests WHERE status = 'pending'"
    );
    return res.status(200).json({ success: true, count });
  } catch (err) {
    return res.status(500).json({ success: false, count: 0 });
  }
};

module.exports = {
  submitServiceRequest,
  getServiceRequests,
  approveServiceRequest,
  rejectServiceRequest,
  getPendingCount,
};
