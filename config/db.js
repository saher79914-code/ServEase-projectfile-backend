// config/db.js
const mysql = require("mysql2/promise"); 

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "auth_db",
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