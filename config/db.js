// config/db.js
const mysql = require("mysql2/promise"); 

const db = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  port:     process.env.DB_PORT     ? parseInt(process.env.DB_PORT) : 3306,
  user:     process.env.DB_USER     || "admin",
  password: process.env.DB_PASS     !== undefined ? process.env.DB_PASS : (process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "YourStrongPassword"),
  database: process.env.DB_NAME     || "serve_ease",
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