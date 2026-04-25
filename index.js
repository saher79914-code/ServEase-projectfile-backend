// ===============================
// Node.js Backend
// index.js
// ===============================

require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// ✅ import routes
const customerRegister = require("./customer_register");
const providerRegister = require("./provider_register");

const app = express();

app.use(cors());
app.use(express.json());


// ✅ STEP 1: DB create karo
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// ✅ STEP 2: DB connect karo
db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// ✅ STEP 3: AB routes call karo (IMPORTANT)
customerRegister(app, db, jwt);
providerRegister(app, db, jwt);

// ===============================
// LOGIN
// ===============================
app.get("/", (req, res) => {
  res.send("Backend is running");
});
app.post("/login", (req, res) => {
  const {full_name, email, password } = req.body;

  // 1️⃣ Check in customers
  const customerSql =
    "SELECT * FROM customers WHERE full_name=? AND email=? AND password=?";

  db.query(customerSql, [full_name, email, password], (err, customerResult) => {
    if (err) {
      return res.status(500).json({ success: false });
    }

    // ✅ Agar customer mil gaya
    if (customerResult.length > 0) {
      const token = jwt.sign(
        {
          id: customerResult[0].id,
          role: "customer",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        success: true,
        role: "customer",
        user: customerResult[0],
        token: token,
      });
    }

    // 2️⃣ Check in providers
    const providerSql =
      "SELECT * FROM service_providers WHERE full_name=? AND email=? AND password=?";

    db.query(providerSql, [full_name, email, password], (err, providerResult) => {
      if (err) {
        return res.status(500).json({ success: false });
      }

      // ✅ Agar provider mil gaya
      if (providerResult.length > 0) {
        const token = jwt.sign(
          {
            id: providerResult[0].id,
            role: "provider",
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return res.json({
          success: true,
          role: "provider",
          user: providerResult[0],
          token: token,
        });
      }

      // ❌ Agar dono me nahi mila
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    });
  });
});
// ✅ STEP 4: server start
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});