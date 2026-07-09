require("dotenv").config();

const path    = require("path");
const express = require("express");
const cors    = require("cors");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS ──
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ["http://localhost:3000", "http://serveease.sandbox.pk"];

app.use(cors({
  origin: (origin, cb) => {
    // Allow mobile apps (no origin), whitelisted origins, localhost, and local network IPs (192.168.x, 10.x, 172.x)
    if (!origin || 
        allowedOrigins.includes(origin) || 
        origin.startsWith("http://localhost:") || 
        origin.startsWith("http://127.0.0.1:") ||
        origin.startsWith("http://192.168.") ||
        origin.startsWith("http://10.") ||
        origin.startsWith("http://172.")) {
      return cb(null, true);
    }
    cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable caching for API routes to prevent 304 Not Modified responses
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// ── Static files ──
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Auth & Register (PUBLIC) ──
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/auth", require("./routes/registerRoutes"));
app.use("/",         require("./routes/authRoutes"));
app.use("/",         require("./routes/registerRoutes"));


// ── Services (GET public, write protected inside route) ──
app.use("/api/services", require("./routes/serviceRoutes"));

// ── Admin (protected inside each route file) ──
app.use("/api/admin/settings",          require("./routes/adminSettingsRoutes"));
app.use("/api/admin/service-requests",  require("./routes/serviceRequestRoutes"));
app.use("/api/admin/users",             require("./routes/userRoutes"));
app.use("/api/users",                   require("./routes/userRoutes"));
app.use("/api/admin",                   require("./routes/complaintRoutes"));

app.use("/api/admin/notifications",     require("./routes/notificationRoutes"));
app.use("/api/admin/services",          require("./routes/serviceRoutes"));
app.use("/api/admin/providers",         require("./routes/providerRoutes"));
app.use("/api/admin",                   require("./routes/providerRoutes"));
app.use("/api/provider",                require("./routes/providerRoutes"));
app.use("/api/admin/commissions",       require("./routes/admincommissionroutes"));
app.use("/api/admin",                   require("./routes/adminSecurityRoutes"));
app.use("/api/admin/bookings",          require("./routes/adminbookingsroutes"));



app.use("/api/admin",                   require("./routes/adminRoutes"));
app.use("/api/admin",                   require("./routes/adminProfileRoutes"));

// ── Provider ──
app.use("/api/providerside", require("./routes/provider/dashboardRoutes"));

// ── Customer ──
app.use("/api/customer", require("./routes/customer/customerRoutes"));

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ──
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ServEase server running on port ${PORT}`);
});