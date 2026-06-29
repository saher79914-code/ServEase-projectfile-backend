const router  = require("express").Router();
const ctrl    = require("../../controllers/provider/dashboardController");
const authMiddleware = require("../../middleware/authMiddleware");
const { securityUpload, commissionUpload } = require("../../middleware/uploads");

const profileCtrl = require("../../controllers/provider/providerProfileController");

router.use(authMiddleware);

router.get ("/dashboard/stats",       ctrl.getDashboardStats);
router.get ("/jobs/new",              ctrl.getNewJobs);
router.get ("/jobs/all",              ctrl.getAllJobs);
router.put ("/jobs/:id/accept",       ctrl.acceptJob);
router.put ("/jobs/:id/decline",      ctrl.declineJob);
router.put ("/jobs/:id/status",       ctrl.updateJobStatus);
router.post("/commission/submit",     commissionUpload.single("screenshot"), ctrl.submitCommission);
router.post("/security-deposit/submit", securityUpload.single("screenshot"), ctrl.submitSecurityDeposit);
router.get ("/security-deposit/status", ctrl.getSecurityDepositStatus);
router.get ("/earnings",              ctrl.getEarnings);
router.post("/complaints",            ctrl.submitComplaint);

router.get ("/profile",              profileCtrl.getProfile);
router.put ("/profile",              profileCtrl.updateProfile);
router.get ("/notifications",        ctrl.getNotifications);
router.put ("/notifications/:id/read", ctrl.markNotificationRead);
router.delete("/notifications/clear", ctrl.clearNotifications);

module.exports = router;
