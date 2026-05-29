const express = require("express");
const router = express.Router();

const {
    getPendingProviders,
    approveProvider,
    rejectProvider
} = require("../controllers/providerController");

// routes
router.get("/pending", getPendingProviders);
router.put("/approve/:id", approveProvider);
router.put("/reject/:id", rejectProvider);

module.exports = router;