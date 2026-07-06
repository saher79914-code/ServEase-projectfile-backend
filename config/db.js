const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "servease",
  port: 3310,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "healthy_wealthy_db",
});

module.exports = db;

