const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(adminOnly);

const ctrl = require("../controllers/complaintController");

router.get("/complaints",            ctrl.getComplaints);
router.put("/complaints/:id/action", ctrl.takeAction);
router.get("/ratings",               ctrl.getRatings);

module.exports = router;