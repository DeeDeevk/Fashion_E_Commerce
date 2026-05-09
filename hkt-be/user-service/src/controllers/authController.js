const authService = require("../services/authService");
const emailService = require("../services/emailService");

const login = async (req, res, next) => {
  try {
    const result = await authService.authenticate(req.body);
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

const introspect = async (req, res, next) => {
  try {
    const result = await authService.introspect(req.body);
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body, emailService);
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, introspect, forgotPassword, resetPassword };
