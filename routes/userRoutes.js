const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    blockUser,
    unblockUser
} = require("../controllers/userController");

// routes

router.get("/", getAllUsers);

router.put("/block/:id", blockUser);

router.put("/unblock/:id", unblockUser);

module.exports = router;