const express      = require("express");
const router       = express.Router();
const {
  registerCustomer,
  registerProvider,
  registerAdmin,
  login,
  getMe,
} = require("../controllers/registercontroller");

const { cnicUpload } = require("../middleware/uploads");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register/customer", registerCustomer);

// Provider registration — 2 images: cnic_front, cnic_back
router.post(
  "/register/provider",
  cnicUpload.fields([
    { name: "cnic_front", maxCount: 1 },
    { name: "cnic_back", maxCount: 1 },
  ]),
  registerProvider
);

router.post("/register/admin", registerAdmin);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

module.exports = router;