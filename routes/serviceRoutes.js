const express = require("express");
const router = express.Router();

const {
    getAllServices,
    addService,
    updateService,
    deleteService,
    toggleServiceStatus
} = require("../controllers/serviceController");

// routes

router.get("/", getAllServices);

router.post("/", addService);

router.put("/:id", updateService);

router.delete("/:id", deleteService);

router.put("/toggle/:id", toggleServiceStatus);

module.exports = router;