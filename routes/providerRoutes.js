const express = require("express");
const router = express.Router();

const {
  getDashboard,
  acceptJob,
  rejectJob,
  getCommission,
} = require("../controllers/providerController");

router.get("/dashboard", getDashboard);

router.post("/jobs/:jobId/accept", acceptJob);

router.post("/jobs/:jobId/reject", rejectJob);

router.get("/commission", getCommission);

module.exports = router;