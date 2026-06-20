const express = require("express");
const router = express.Router();

const {
  registerCustomer,
  registerProvider,
  login,
} = require("../controllers/authController");

router.post("/register/customer", registerCustomer);
router.post("/register/provider", registerProvider);
router.get("/login", login);

module.exports = router;