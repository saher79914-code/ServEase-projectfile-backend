const db = require('../config/db');


// ============================
// GET ALL SERVICES
// ============================
const getServices = (req, res) => {
  const sql = 'SELECT * FROM services ORDER BY id DESC';

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Fetch failed',
        error: err,
      });
    }

    res.status(200).json(result);
  });
};


// ============================
// CREATE SERVICE
// ============================
const createService = (req, res) => {
  const {
    name,
    description,
    price,
    category,
    icon,
    is_active,
  } = req.body;

  const sql = `
    INSERT INTO services
    (name, description, price, category, icon, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, description, price, category, icon, is_active],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Create failed',
          error: err,
        });
      }

      res.status(201).json({
        message: 'Service created',
        id: result.insertId,
      });
    }
  );
};


// ============================
// UPDATE SERVICE
// ============================
const updateService = (req, res) => {
  const { id } = req.params;

  const {
    name,
    description,
    price,
    category,
    icon,
    is_active,
  } = req.body;

  const sql = `
    UPDATE services
    SET
      name = ?,
      description = ?,
      price = ?,
      category = ?,
      icon = ?,
      is_active = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      name,
      description,
      price,
      category,
      icon,
      is_active,
      id,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: 'Update failed',
          error: err,
        });
      }

      res.status(200).json({
        message: 'Service updated',
      });
    }
  );
};


// ============================
// DELETE SERVICE
// ============================
const deleteService = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM services WHERE id = ?';

  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({
        message: 'Delete failed',
        error: err,
      });
    }

    res.status(200).json({
      message: 'Service deleted',
    });
  });
};


// ============================
// TOGGLE ACTIVE
// ============================
const toggleService = (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  const sql = `
    UPDATE services
    SET is_active = ?
    WHERE id = ?
  `;

  db.query(sql, [is_active, id], (err) => {
    if (err) {
      return res.status(500).json({
        message: 'Toggle failed',
        error: err,
      });
    }

    res.status(200).json({
      message: 'Status updated',
    });
  });
};


module.exports = {
  getServices,
  createService,
  updateService,
  deleteService,
  toggleService,
};