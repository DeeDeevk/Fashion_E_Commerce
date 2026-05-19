const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET;

// ==================== ACCESS TOKEN (HS512) ====================
const generateToken = (payload) => {
  return jwt.sign(payload, Buffer.from(SECRET), {
    algorithm: "HS512",
    expiresIn: "24h",
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, Buffer.from(SECRET), { algorithms: ["HS512"] });
};

// ==================== RESET PASSWORD TOKEN (HS256) ====================
const generateResetToken = (email) => {
  return jwt.sign({ sub: email }, SECRET, {
    algorithm: "HS256",
    expiresIn: "15m",
  });
};

const extractEmailFromResetToken = (token) => {
  const decoded = jwt.verify(token, SECRET, { algorithms: ["HS256"] });
  return decoded.sub;
};

// Tương đương validatePasswordResetToken() trong JwtService.java
const validateResetToken = (token) => {
  try {
    jwt.verify(token, SECRET, { algorithms: ["HS256"] });
    return true;
  } catch (err) {
    console.error("JWT reset token validation error:", err.message);
    return false;
  }
};

module.exports = {
  generateToken,
  verifyAccessToken,
  generateResetToken,
  extractEmailFromResetToken,
  validateResetToken,
};
