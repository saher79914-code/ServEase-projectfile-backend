module.exports = function (app, db, jwt) {
  app.post("/register/customer", (req, res) => {
    const {
      full_name,
      email,
      phone,
      cnic,
      address,
      password
    } = req.body;

    // Validation
    if (
      !full_name ||
      !email ||
      !phone ||
      !cnic ||
      !address ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing email
    const checkEmailSql =
      "SELECT * FROM customers WHERE email = ?";

    db.query(checkEmailSql, [email], (err, result) => {
      if (err) {
        console.log("Check Email Error:", err);

        return res.status(500).json({
          success: false,
          message: "Server Error",
        });
      }

      if (result.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Insert customer
      const insertSql = `
        INSERT INTO customers
        (full_name, email, phone, cnic, address, password)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          full_name,
          email,
          phone,
          cnic,
          address,
          password
        ],
        (err, result) => {
          if (err) {
            console.log("Insert Error:", err);

            return res.status(500).json({
              success: false,
              message: "Registration Failed",
            });
          }

          const token = jwt.sign(
            {
              id: result.insertId,
              email: email,
              role: "customer"
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "1h"
            }
          );

          return res.status(201).json({
            success: true,
            message: "Customer Registered Successfully",
            token: token,
            customerId: result.insertId
          });
        }
      );
    });
  });
};