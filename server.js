const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))


// Routes
app.use("/", require("./routes/registerRoutes"));
app.use("/services", require("./routes/serviceRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin/provider/register", require("./routes/registerRoutes"));
app.use("/api/admin/users", require("./routes/userRoutes"));
app.use("/api/admin/complaints", require("./routes/complaintRoutes"));
app.use("/api/admin/notifications", require("./routes/notificationRoutes"));
app.use("/api/admin/services", require("./routes/serviceRoutes"));
app.use( "/api/admin",require("./routes/adminProfileRoutes"));
app.use( "/uploads",express.static("uploads"));
app.use("/api/admin/providers", require("./routes/providerRoutes"));
app.use("/api/provider", require("./routes/registerRoutes"));

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});