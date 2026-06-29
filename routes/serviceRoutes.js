const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { adminOnly } = require('../middleware/roleMiddleware');

const {
  getServices,
  getServiceById,
  createService,
  updateService,
  toggleService,
  deleteService,
} = require("../controllers/serviceController");

router.get("/", getServices);

router.get("/:id", getServiceById);

router.post("/", authMiddleware, adminOnly, createService);

router.put("/:id", authMiddleware, adminOnly, updateService);

router.patch("/:id/toggle", authMiddleware, adminOnly, toggleService);

router.delete("/:id", authMiddleware, adminOnly, deleteService);

module.exports = router;