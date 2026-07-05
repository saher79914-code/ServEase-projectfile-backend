const express = require("express");
const cors = require("cors");

const authRoutes = require("./routers/authRouters");

const app = express();

const cors = require("cors");

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.send("ServEase API is running");
});

module.exports = app;