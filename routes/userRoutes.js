const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(adminOnly);

const {
  getAllUsers,
  getBlockedUsers,
  getUserById,
  addUser,
  blockUser,
  unblockUser
} = require("../controllers/userController");

router.get("/", getAllUsers);

router.get("/blocked", getBlockedUsers);

router.get("/:id", getUserById);

router.post("/", addUser);

router.patch("/:id/block", blockUser);

router.patch("/:id/unblock", unblockUser);

module.exports = router;