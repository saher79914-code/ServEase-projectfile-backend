const router = require("express").Router();
const ctrl   = require("../controllers/Adminbookingscontroller");

router.get("/", ctrl.getAllBookings);

module.exports = router;