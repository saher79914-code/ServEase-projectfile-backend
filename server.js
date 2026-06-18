const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Auth Routes (OTP + Forgot/Reset Password) ──
app.use("/api/auth", require("./routes/authRoutes"));

// ── Register & Login ──
app.use("/", require("./routes/registerRoutes"));
app.use("/api/auth", require("./routes/registerRoutes"));

// ── Services ──
app.use("/services", require("./routes/serviceRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));

// ── Admin — specific routes PEHLE, generic baad mein ──
app.use("/api/admin/settings",         require("./routes/adminSettingsRoutes"));
app.use("/api/admin/service-requests", require("./routes/serviceRequestRoutes"));
app.use("/api/admin/users",            require("./routes/userRoutes"));
app.use("/api/admin/complaints",       require("./routes/complaintRoutes"));
app.use("/api/admin/notifications",    require("./routes/notificationRoutes"));
app.use("/api/admin/services",         require("./routes/serviceRoutes"));
app.use("/api/admin/providers",        require("./routes/providerRoutes"));
app.use("/api/admin/commissions",      require("./routes/admincommissionroutes"));
app.use("/api/admin/bookings",         require("./routes/adminbookingsroutes"));
app.use("/api/admin",                  require("./routes/adminRoutes"));
app.use("/api/admin",                  require("./routes/adminProfileRoutes"));
app.use("/api/admin",                  require("./routes/adminSecurityRoutes"));
app.use("/api/admin",                  require("./routes/complaintRoutes"));

// ── Service Requests (provider registration ke waqt) ──
app.use("/api/service-requests", require("./routes/serviceRequestRoutes"));

// ── Provider ──
app.use("/api/provider",   require("./routes/registerRoutes"));
app.use("/api/provider",   require("./routes/providerRoutes"));
app.use("/api/providerside", require("./routes/provider/dashboardRoutes"));

// ── Customer ──
app.use("/api/customer", require("./routes/customer/customerRoutes"));

// ── Users ──
app.use("/api/users", require("./routes/userRoutes"));

// ── Static uploads ──
app.use("/uploads", express.static("uploads"));

// ── Server ──
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});