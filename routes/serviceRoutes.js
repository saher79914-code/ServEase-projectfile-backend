const express = require("express");
const router = express.Router();

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

router.post("/", createService);

router.put("/:id", updateService);

router.patch("/:id/toggle", toggleService);

router.delete("/:id", deleteService);

module.exports = router;