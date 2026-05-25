const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploads");

const {
  getProfile,
  updateProfile,
  resetPassword,
} = require("../controllers/adminProfileController");

router.get(
  "/profile/:id",
  getProfile
);

router.put(
  "/profile/update/:id",
  upload.single("profile_image"),
  updateProfile
);

router.put(
  "/profile/reset-password/:id",
  resetPassword
);

module.exports = router;