const db = require('../config/db');

const getDashboardStats = (req, res) => {

  const adminQuery =
    'SELECT COUNT(*) AS totalAdmins FROM users';

  const servicesQuery =
    'SELECT COUNT(*) AS totalServices FROM services';

  const providersQuery =
    'SELECT COUNT(*) AS totalProviders FROM providers';

  db.query(adminQuery, (err, adminResult) => {

    if (err) {
      return res.status(500).json({
        error: err.message,
      });
    }

    db.query(servicesQuery, (err, servicesResult) => {

      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      db.query(providersQuery, (err, providersResult) => {

        if (err) {
          return res.status(500).json({
            error: err.message,
          });
        }

        res.json({

          totalAdmins:
              adminResult[0].totalAdmins,

          totalServices:
              servicesResult[0].totalServices,

          totalProviders:
              providersResult[0].totalProviders,
        });
      });
    });
  });
};

module.exports = {
  getDashboardStats,
};