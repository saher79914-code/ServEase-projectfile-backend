const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "auth_db",
};

async function main() {
  console.log("Starting database and uploads cleanup...");
  let pool;
  try {
    pool = mysql.createPool(dbConfig);

    // 1. Delete test complaints (child of bookings)
    console.log("Clearing complaints...");
    await pool.query("DELETE FROM complaints");

    // 2. Delete test commission payments
    console.log("Clearing commission payments...");
    await pool.query("DELETE FROM commission_payments");

    // 3. Delete notifications
    console.log("Clearing notifications...");
    await pool.query("DELETE FROM notifications");

    // 4. Delete test bookings (parent of complaints)
    console.log("Clearing bookings...");
    await pool.query("DELETE FROM bookings");

    // 5. Delete custom service requests
    console.log("Clearing service requests...");
    await pool.query("DELETE FROM service_requests");

    // 6. Delete password resets
    console.log("Clearing password resets...");
    await pool.query("DELETE FROM password_resets");

    // 7. Delete test users (email ending with @test.com or name containing 'Test')
    console.log("Deleting test users...");
    const [result] = await pool.query(
      "DELETE FROM users WHERE email LIKE '%@test.com' OR full_name LIKE '%Test%'"
    );
    console.log(`Deleted ${result.affectedRows} test users.`);

    // 8. Reset real providers to default state so they can test the deposit & commission flow from scratch
    console.log("Resetting provider profiles to default pending/zero state...");
    await pool.query(`
      UPDATE provider_profiles 
      SET pending_commission = 0.00, 
          security_deposit_status = 'pending', 
          security_deposit_screenshot = NULL, 
          security_deposit_method = NULL
    `);

    console.log("✅ Database cleanup finished successfully!");

    // 9. Clean up uploads directories
    const uploadDirs = ["security", "commission", "profile", "cnic"];
    const uploadsRoot = path.join(__dirname, "uploads");

    for (const dir of uploadDirs) {
      const dirPath = path.join(uploadsRoot, dir);
      if (fs.existsSync(dirPath)) {
        console.log(`Cleaning uploads/${dir} directory...`);
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          // Don't delete .gitkeep or hidden files
          if (!file.startsWith(".")) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }
    console.log("✅ Uploaded files cleanup finished successfully!");

  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

main();
