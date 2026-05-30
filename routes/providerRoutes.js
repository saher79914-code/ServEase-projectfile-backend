const express = require("express");
const router = express.Router();

const {
    getPendingProviders,
    approveProvider,
    rejectProvider,
} = require("../controllers/providerController");
//show list of provider that rejected and approved
const {
  getAcceptanceList
} = require("../controllers/providerController");

// routes
router.get("/pending", getPendingProviders);
router.put("/approve/:id", approveProvider);
router.put("/reject/:id", rejectProvider);
router.get("/acceptance-list",getAcceptanceList);

module.exports = router;