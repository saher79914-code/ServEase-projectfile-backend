const router = require("express").Router();
const ctrl   = require("../../controllers/customer/customerController");

router.get("/home",      ctrl.getHomeData);
router.get("/providers", ctrl.getProviders);

module.exports = router;