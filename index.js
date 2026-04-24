// ===============================
// Node.js Backend
// index.js
// ===============================

require("dotenv").config();

const express = require("express");
<<<<<<< HEAD
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// ✅ import routes
const customerRegister = require("./customer_register");
const providerRegister = require("./provider_register");

const app = express();
=======
const cors = require("cors");
const app = express();
const port = 3000;
>>>>>>> 666302c9a9566580ebefe9830ee2a3b92e1fee34

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and Password are required",
    });
  }

  const sql =
    "SELECT * FROM customers WHERE  name=? AND password = ? AND email = ?";

  db.query(sql, [name, password, email], (err, result) => {
    if (err) {
  console.log("SQL Error:", err);

  return res.status(500).json({
    success: false,
    message: err.message,
  });
}

    if (result.length > 0) {
      const user = result[0];

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      return res.status(200).json({
        success: true,
        message: "Login Successful",
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }
  });
});
 

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
=======
// Routes
app.use("/", require("./routes/authRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/admin/members", require("./routes/memberRoutes"));

app.get("/", (req, res) => res.send("GymSwift API is running"));

app.listen(port, () => console.log(`GymSwift server running on port ${port}`));
>>>>>>> 666302c9a9566580ebefe9830ee2a3b92e1fee34
