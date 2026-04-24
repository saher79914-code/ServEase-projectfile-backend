const jwt = require("jsonwebtoken");
const {
  findCustomer,
  findProvider
} = require("../models/authModel");

const { JWT_SECRET } = require("../middleware/authMiddleware");

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", { email, passwordProvided: !!password });

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and Password are required"
    });
  }

  try {
    console.log("Searching for customer...");
    const customers = await findCustomer(email, password);

    if (customers.length > 0) {
      console.log("Customer found!");
      const user = customers[0];

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: "customer"
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.json({
        success: true,
        message: "Login Successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          role: "customer"
        }
      });
    }

    console.log("No customer found, searching for provider...");
    const providers = await findProvider(email, password);

    if (providers.length > 0) {
      console.log("Provider found!");
      const user = providers[0];

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: "provider"
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.json({
        success: true,
        message: "Login Successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          role: "provider"
        }
      });
    }

    console.log("User not found");
    return res.status(401).json({
      success: false,
      message: "Invalid Email or Password"
    });

  } catch (error) {
    console.error("Login error:", error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

module.exports = {
  login
};