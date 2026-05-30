const express = require("express");
const router = express.Router();

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