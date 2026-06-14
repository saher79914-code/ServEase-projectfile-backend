const router = require("express").Router();
const ctrl = require("../controllers/ComplaintController");

router.get("/complaints",            ctrl.getComplaints);
router.put("/complaints/:id/action", ctrl.takeAction);
router.get("/ratings",               ctrl.getRatings);

module.exports = router;