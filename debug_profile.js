const db = require("./config/db");

async function main() {
  try {
    console.log("--- PROVIDER 58 DATA ---");
    const [[user]] = await db.query("SELECT * FROM users WHERE id = 58");
    console.log("User:", user);

    const [[profile]] = await db.query("SELECT * FROM provider_profiles WHERE user_id = 58");
    console.log("Profile:", profile);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

main();
