const pool = require("../config/db");

const findCustomer = async (email, password) => {
  const [rows] = await pool.query(
    "SELECT * FROM customers WHERE email = ? AND password = ?",
    [email, password]
  );
  return rows;
};

const findProvider = async (email, password) => {
  const [rows] = await pool.query(
    "SELECT * FROM service_providers WHERE email = ? AND password = ?",
    [email, password]
  );
  return rows;
};

module.exports = {
  findCustomer,
  findProvider
};