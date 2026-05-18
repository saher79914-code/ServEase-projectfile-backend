const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Routes
app.use("/", require("./routes/registerRoutes"));
app.use("/providers", require("./routes/providerRoutes"));
app.use("/services", require("./routes/serviceRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));
// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
