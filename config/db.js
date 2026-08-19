// config/db.js
const mysql = require("mysql2/promise"); 

const db = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  user:     process.env.DB_USER     && process.env.DB_USER !== "admin" ? process.env.DB_USER : "root",
  password: process.env.DB_PASS     && process.env.DB_PASS !== "YourStrongPassword" ? process.env.DB_PASS : "",
  database: process.env.DB_NAME     && process.env.DB_NAME !== "serve_ease" ? process.env.DB_NAME : "auth_db",
  waitForConnections: true,
  connectionLimit: 10,
});

db.getConnection()
  .then((conn) => {
    console.log("✅ ServEase DB Connected Successfully (auth_db)");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err.message);
  });

module.exports = db;