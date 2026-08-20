const db = require("../config/db");

exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query(
      `SELECT COUNT(*) AS totalUsers FROM users`);
    const [[{ totalCustomers }]] = await db.query(
      `SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'customer'`);
    const [[{ totalProviders }]] = await db.query(
      `SELECT COUNT(*) AS totalProviders FROM users WHERE role = 'provider'`);
    const [[{ totalServices }]] = await db.query(
      `SELECT COUNT(*) AS totalServices FROM services WHERE is_active = 1`);
    const [[{ totalBookings }]] = await db.query(
      `SELECT COUNT(*) AS totalBookings FROM bookings`);
    const [[{ openComplaints }]] = await db.query(
      `SELECT COUNT(*) AS openComplaints FROM complaints WHERE status = 'pending'`);
    const [[{ pendingProviders }]] = await db.query(
      `SELECT COUNT(*) AS pendingProviders FROM provider_profiles WHERE approval_status = 'pending'`);

    // Commission payments (10% wali)
    const [[{ commissionEarned }]] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS commissionEarned 
       FROM commission_payments WHERE status = 'verified'`);

    const [[settings]] = await db.query(
      `SELECT commission_rate FROM app_settings LIMIT 1`
    );
    const commissionRate = settings ? parseFloat(settings.commission_rate) : 10.00;

    // Security deposits
    const [[{ securityDeposits }]] = await db.query(
      `SELECT COUNT(*) AS securityDeposits 
       FROM provider_profiles WHERE security_deposit_status = 'verified'`);

    // Pending counts for Admin Drawer badges
    const [[{ pendingCommissions }]] = await db.query(
      `SELECT COUNT(*) AS pendingCommissions FROM commission_payments WHERE status = 'submitted'`);
    const [[{ pendingSecurityDeposits }]] = await db.query(
      `SELECT COUNT(*) AS pendingSecurityDeposits FROM provider_profiles WHERE security_deposit_status = 'submitted'`);
    const [[{ unreadNotifications }]] = await db.query(
      `SELECT COUNT(*) AS unreadNotifications FROM notifications WHERE role = 'admin' AND is_read = 0`);

    // Admin profile info
    const [[adminUser]] = await db.query(
      `SELECT full_name, email FROM users WHERE role = 'admin' LIMIT 1`);

    // Security deposit total amount (from app_settings.security_deposit_amount)
    const [[{ securityAmount }]] = await db.query(
      `SELECT COALESCE(
         (SELECT security_deposit_amount FROM app_settings LIMIT 1), 500
       ) * COUNT(*) AS securityAmount 
       FROM provider_profiles WHERE security_deposit_status = 'verified'`
    ).catch(() => [[{ securityAmount: 0 }]]);

    const totalEarnings = parseFloat(commissionEarned) + parseFloat(securityAmount || 0);

    res.json({
      totalUsers, totalCustomers, totalProviders,
      totalServices, totalBookings, openComplaints,
      pendingProviders,
      pendingCommissions: parseInt(pendingCommissions || 0),
      pendingSecurityDeposits: parseInt(pendingSecurityDeposits || 0),
      unreadNotifications: parseInt(unreadNotifications || 0),
      adminName: adminUser ? adminUser.full_name : "Admin",
      adminEmail: adminUser ? adminUser.email : "admin@servease.pk",
      commissionEarned:  parseFloat(commissionEarned),
      commissionRate,
      securityDeposits:  parseInt(securityDeposits),
      securityAmount:    parseFloat(securityAmount || 0),
      totalEarnings,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};