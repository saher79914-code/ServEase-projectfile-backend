const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const { adminOnly } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(adminOnly);

const ctrl   = require("../controllers/Adminbookingscontroller");

router.get("/", ctrl.getAllBookings);

module.exports = router;