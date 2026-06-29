/**
 * Role-Based Access Control Middleware
 * Use after authMiddleware to restrict endpoints by user role.
 */

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
    });
  }
  next();
};

const providerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "provider") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Provider access required",
    });
  }
  next();
};

const customerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "customer") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Customer access required",
    });
  }
  next();
};

module.exports = { adminOnly, providerOnly, customerOnly };
