const router = require("express").Router();
const ctrl = require("../controllers/adminSecurityController");

router.get("/security-deposits",            ctrl.getSecurityDeposits);
router.put("/security-deposits/:id/verify", ctrl.verifyDeposit);
router.put("/security-deposits/:id/reject", ctrl.rejectDeposit);

module.exports = router;