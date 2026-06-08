const router = require("express").Router();
const ctrl   = require("../controllers/admincommissionController");

router.get("/"           , ctrl.getAllCommissions);
router.put("/:id/verify" , ctrl.verifyCommission);
router.put("/:id/reject" , ctrl.rejectCommission);

module.exports = router;