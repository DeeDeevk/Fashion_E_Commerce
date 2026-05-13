const { verifyAccessToken } = require("../config/jwt");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ code: 1006, message: "Unauthenticated" });
  }

  try {
    req.user = verifyAccessToken(token); // ✅ dùng từ jwt.js
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ code: 1006, message: "Token invalid or expired" });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.scope;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ code: 1007, message: "Unauthorized" });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
