const router = require("express").Router();
const authMiddleware = require("../../middleware/authMiddleware");
const { upload } = require("../../middleware/uploads");

router.use(authMiddleware);

const ctrl   = require("../../controllers/customer/customerController");

router.get("/home",      ctrl.getHomeData);
router.get("/providers", ctrl.getProviders);

router.get("/provider/:id", ctrl.getProviderDetail);
router.post("/bookings",    ctrl.createBooking);
router.get("/bookings",     ctrl.getMyBookings);

router.get ("/profile",         ctrl.getProfile);
router.put ("/profile",         upload.single("profile_image"), ctrl.updateProfile);
router.put ("/change-password", ctrl.changePassword);
router.post("/forgot-password", ctrl.forgotPassword);
router.get("/notifications",        ctrl.getNotifications);
router.put("/notifications/:id/read", ctrl.markNotificationRead);
router.delete("/notifications/clear", ctrl.clearNotifications);
router.post("/complaints", ctrl.submitComplaint);
router.post("/ratings",    ctrl.submitRating);

module.exports = router;
