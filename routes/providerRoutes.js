const express = require("express");

const router = express.Router();

const {
  getPendingProviders,
  approveProvider,
  rejectProvider
} = require("../controllers/providerController");

// GET PENDING PROVIDERS
router.get(
  "/pending",
  getPendingProviders
);

// APPROVE PROVIDER
router.put(
  "/approve/:id",
  approveProvider
);

// REJECT PROVIDER
router.put(
  "/reject/:id",
  rejectProvider
);

module.exports = router;