const express = require("express");
const router = express.Router();
const {
  sendNotification,
  getAllNotifications,
  getNotifications,
} = require("../controllers/notificationController");

router.post("/send",        sendNotification);
router.get("/all",          getAllNotifications);
router.get("/:userId",      getNotifications);

module.exports = router;