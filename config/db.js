// config/db.js
const mysql = require("mysql2/promise"); 

const db = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  user:     process.env.DB_USER     || "admin",
  password: process.env.DB_PASS     || "YourStrongPassword",
  database: process.env.DB_NAME     || "serve_ease",
  waitForConnections: true,
  connectionLimit: 10,
});

db.getConnection()
  .then((conn) => {
    console.log("✅ DB Connected");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err.message);
  });


module.exports = db;