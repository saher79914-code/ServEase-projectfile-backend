const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {

    const [users] = await db.query(
      'SELECT COUNT(*) AS totalUsers FROM users'
    );

    const [customers] = await db.query(
      'SELECT COUNT(*) AS totalCustomers FROM users WHERE role = "customer"'
    );

    const [providers] = await db.query(
      'SELECT COUNT(*) AS totalProviders FROM users WHERE role = "provider"'
    );

    const [services] = await db.query(
      'SELECT COUNT(*) AS totalServices FROM services'
    );

    const [bookings] = await db.query(
      'SELECT COUNT(*) AS totalBookings FROM bookings'
    );

    const [pendingProviders] = await db.query(
      'SELECT COUNT(*) AS pendingProviders FROM provider_profiles WHERE approval_status = "pending"'
    );

    const [complaintsResult] = await db.query(
  "SELECT COUNT(*) AS openComplaints FROM complaints WHERE status = 'pending'"
    );

    const [adminData] = await db.query(
  "SELECT full_name,email FROM users WHERE role='admin'"
    );
const [[{ count: pendingSecurityDeposits }]] = await db.query(
  `SELECT COUNT(*) AS count FROM provider_profiles WHERE security_deposit_status = 'submitted'`
);
    res.status(200).json({
      success: true,
      totalUsers: users[0].totalUsers,
      totalCustomers: customers[0].totalCustomers,
      totalProviders: providers[0].totalProviders,
      totalServices: services[0].totalServices,
      totalBookings: bookings[0].totalBookings,
      openComplaints: complaintsResult[0].openComplaints,
      pendingProviders: pendingProviders[0].pendingProviders,
      adminName:adminData[0]?.full_name || "",
      adminEmail:adminData[0]?.email || "",
      pendingSecurityDeposits: pendingSecurityDeposits,
    });

  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

module.exports = { getDashboardStats };
