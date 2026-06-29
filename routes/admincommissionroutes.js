const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const { adminOnly } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(adminOnly);

const ctrl   = require("../controllers/admincommissionController");

router.get("/"           , ctrl.getAllCommissions);
router.put("/:id/verify" , ctrl.verifyCommission);
router.put("/:id/reject" , ctrl.rejectCommission);

module.exports = router;