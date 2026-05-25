const express = require("express");
const router = express.Router();

const {
    getAllComplaints,
    resolveComplaint
} = require("../controllers/complaintController");

// admin only
router.get("/", getAllComplaints);
router.put("/resolve/:id", resolveComplaint);

module.exports = router;