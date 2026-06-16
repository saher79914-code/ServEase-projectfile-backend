const router  = require("express").Router();
const multer  = require("multer");
const ctrl    = require("../../controllers/provider/dashboardController");
const checkBlocked = require("../../middleware/checkBlocked"); // ← ADD
const { securityUpload } = require("../../middleware/uploads");
const upload  = multer({ dest: "uploads/commission/" });

// ← Saari routes pe checkBlocked lagao
router.get ("/dashboard/stats",       checkBlocked, ctrl.getDashboardStats);
router.get ("/jobs/new",              checkBlocked, ctrl.getNewJobs);
router.get ("/jobs/all",              checkBlocked, ctrl.getAllJobs);
router.put ("/jobs/:id/accept",       checkBlocked, ctrl.acceptJob);
router.put ("/jobs/:id/decline",      checkBlocked, ctrl.declineJob);
router.put ("/jobs/:id/status",       checkBlocked, ctrl.updateJobStatus);
router.post("/commission/submit",     checkBlocked, upload.single("screenshot"), ctrl.submitCommission);
router.post("/security-deposit/submit", checkBlocked, securityUpload.single("screenshot"), ctrl.submitSecurityDeposit);
router.get("/security-deposit/status", checkBlocked, ctrl.getSecurityDepositStatus);
router.get("/earnings", checkBlocked, ctrl.getEarnings);
router.post("/security-deposit/submit", checkBlocked, securityUpload.single("screenshot"), ctrl.submitSecurityDeposit);
router.get ("/security-deposit/status", checkBlocked, ctrl.getSecurityDepositStatus);
router.post("/complaints", checkBlocked, ctrl.submitComplaint);

module.exports = router;

const profileCtrl = require("../../controllers/provider/providerProfileController");
router.get ("/profile",              checkBlocked, profileCtrl.getProfile);
router.put ("/profile",              checkBlocked, profileCtrl.updateProfile);
router.get ("/notifications",        checkBlocked, ctrl.getNotifications);
router.put ("/notifications/:id/read", checkBlocked, ctrl.markNotificationRead);
router.delete("/notifications/clear", checkBlocked, ctrl.clearNotifications);