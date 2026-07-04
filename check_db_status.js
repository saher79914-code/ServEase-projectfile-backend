const db = require("./config/db");
async function test() {
  try {
    const [notifications] = await db.query("SELECT * FROM auth_db.notifications ORDER BY id DESC LIMIT 5");
    console.log("LAST 5 NOTIFICATIONS IN DB:", notifications);
    process.exit(0);
  } catch (err) {
    console.error("DB Query Error:", err.message);
    process.exit(1);
  }
}
test();
