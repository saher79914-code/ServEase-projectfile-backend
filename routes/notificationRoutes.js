const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { adminOnly } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(adminOnly);

const {
  sendNotification,
  getAllNotifications,
  getNotifications,
  clearAllNotifications
} = require("../controllers/notificationController");

router.post("/send",        sendNotification);
router.get("/",             getAllNotifications);
router.get("/all",          getAllNotifications);
router.get("/:userId",      getNotifications);
router.delete("/clear-all", clearAllNotifications);


module.exports = router;
