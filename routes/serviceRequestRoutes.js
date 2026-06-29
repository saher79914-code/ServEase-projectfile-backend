const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { adminOnly } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(adminOnly);

const {
  submitServiceRequest,
  getServiceRequests,
  approveServiceRequest,
  rejectServiceRequest,
  getPendingCount,
} = require("../controllers/serviceRequestController");

// ⚠️ Specific routes PEHLE — /:id se pehle aane chahiye
router.get("/pending-count", getPendingCount);
router.get("/", getServiceRequests);
router.post("/", submitServiceRequest);
router.put("/:id/approve", approveServiceRequest);
router.put("/:id/reject", rejectServiceRequest);

module.exports = router;