const db = require("./config/db");
async function test() {
  try {
    const [services] = await db.query("SELECT DISTINCT name, category FROM auth_db.services LIMIT 20");
    console.log("AVAILABLE SERVICES IN SYSTEM:", services);
    process.exit(0);
  } catch (err) {
    console.error("DB Query Error:", err.message);
    process.exit(1);
  }
}
test();
