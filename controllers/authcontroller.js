const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerCustomer = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      cnic,
      address,
      password,
    } = req.body;

    const checkUser =
      "SELECT * FROM users WHERE email = ?";

    db.query(checkUser, [email], async (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      const hashedPassword =
        await bcrypt.hash(password, 10);

      const sql = `
      INSERT INTO users
      (
        full_name,
        email,
        phone,
        cnic,
        address,
        password,
        role
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [
          full_name,
          email,
          phone,
          cnic,
          address,
          hashedPassword,
          "customer",
        ],
        (err) => {
          if (err) {
            return res.status(500).json(err);
          }

          res.status(201).json({
            success: true,
            message: "Customer registered successfully",
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const registerProvider = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      cnic,
      address,
      password,
    } = req.body;

    const checkUser =
      "SELECT * FROM users WHERE email = ?";

    db.query(checkUser, [email], async (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      const hashedPassword =
        await bcrypt.hash(password, 10);

      const sql = `
      INSERT INTO users
      (
        full_name,
        email,
        phone,
        cnic,
        address,
        password,
        role
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [
          full_name,
          email,
          phone,
          cnic,
          address,
          hashedPassword,
          "provider",
        ],
        (err) => {
          if (err) {
            return res.status(500).json(err);
          }

          res.status(201).json({
            success: true,
            message: "Provider registered successfully",
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const login = (req, res) => {
  const { email, password } = req.body;

  const sql =
    "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result[0];

    if (
      user.is_blocked === 1 ||
      user.status === "blocked"
    ) {
      return res.status(403).json({
        success: false,
        message: "Account blocked",
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      "servease_secret_key",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      role: user.role,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  });
};

module.exports = {
  registerCustomer,
  registerProvider,
  login,
};