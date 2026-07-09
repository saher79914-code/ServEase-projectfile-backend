module.exports = function (app, db, jwt) {
  app.post("/register/provider", (req, res) => {
    const {
      full_name,
      email,
      phone,
      cnic,
      address,
      password,
      category,
      years_of_experience,
      bio
    } = req.body;

    // ✅ Validation
    if (
      !full_name ||
      !email ||
      !phone ||
      !cnic ||
      !address ||
      !password ||
      !category ||
      !years_of_experience
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // ✅ Check email exists
    const checkEmail =
      "SELECT * FROM service_providers WHERE email = ?";

    db.query(checkEmail, [email], (err, result) => {
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

      // ✅ Insert provider
      const insertSql = `
        INSERT INTO service_providers
        (full_name, email, phone, cnic, address, password, category, years_of_experience, bio, status, rating, total_reviews)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          full_name,
          email,
          phone,
          cnic,
          address,
          password,
          category,
          years_of_experience,
          bio || "",
          "pending",   // default status
          0,           // rating
          0            // reviews
        ],
        (err, result) => {
          if (err) {
            console.log("Insert Error:", err);
            return res.status(500).json({
              success: false,
              message: "Registration Failed",
            });
          }

          // ✅ Token generate
          const token = jwt.sign(
            {
              id: result.insertId,
              email: email,
              role: "provider",
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );

          return res.status(201).json({
            success: true,
            message: "Provider Registered Successfully",
            token: token,
            providerId: result.insertId,
          });
        }
      );
    });
  });
};