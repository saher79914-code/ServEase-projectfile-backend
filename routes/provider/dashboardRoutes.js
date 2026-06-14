const router  = require("express").Router();
const multer  = require("multer");
const ctrl    = require("../../controllers/provider/dashboardController");

const upload  = multer({ dest: "uploads/commission/" });

router.get ("/dashboard/stats",       ctrl.getDashboardStats);
router.get ("/jobs/new",              ctrl.getNewJobs);
router.get ("/jobs/all",              ctrl.getAllJobs);
router.put ("/jobs/:id/accept",       ctrl.acceptJob);
router.put ("/jobs/:id/decline",      ctrl.declineJob);
router.put ("/jobs/:id/status",       ctrl.updateJobStatus);
router.post("/commission/submit",     upload.single("screenshot"), ctrl.submitCommission);
router.get("/earnings", ctrl.getEarnings);


module.exports = router;
// Profile routes
const profileCtrl = require("../../controllers/provider/providerProfileController");
router.get ("/profile",              profileCtrl.getProfile);
router.put ("/profile",              profileCtrl.updateProfile);
router.get ("/notifications",        ctrl.getNotifications);
router.put("/notifications/:id/read", ctrl.markNotificationRead);
 