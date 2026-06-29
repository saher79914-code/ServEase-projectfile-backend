const db = require("./config/db");

async function main() {
  try {
    const [services] = await db.query("SELECT * FROM services");
    console.log("Services in database:");
    console.table(services);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await db.end();
  }
}

main();
