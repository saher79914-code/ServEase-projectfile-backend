const express = require("express");
const router = express.Router();

const {
    sendNotification,
    getNotifications
} = require("../controllers/notificationController");

// admin send
router.post("/send", sendNotification);

// user fetch
router.get("/:userId", getNotifications);

module.exports = router;