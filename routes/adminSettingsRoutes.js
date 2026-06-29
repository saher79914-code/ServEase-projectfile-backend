const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { adminOnly } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(adminOnly);

const { getSettings, updateSettings } = require("../controllers/adminSettingsController");

router.get("/", getSettings);
router.put("/", updateSettings);

module.exports = router;
