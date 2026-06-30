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
      commissionEarned:  parseFloat(commissionEarned),
      commissionRate,
      securityDeposits:  parseInt(securityDeposits),
      securityAmount:    parseFloat(securityAmount || 0),
      totalEarnings,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};