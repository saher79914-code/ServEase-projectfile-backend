const express = require("express");
const router = express.Router();
const {
  sendNotification,
  getAllNotifications,
  getNotifications,
  clearAllNotifications
} = require("../controllers/notificationController");

router.post("/send",        sendNotification);
router.get("/all",          getAllNotifications);
router.get("/:userId",      getNotifications);
router.delete("/clear-all", clearAllNotifications);

module.exports = router;
