const router = require("express").Router();
const ctrl   = require("../controllers/adminBookingsController");

router.get("/", ctrl.getAllBookings);

module.exports = router;