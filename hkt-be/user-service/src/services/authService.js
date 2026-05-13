const bcrypt = require("bcrypt");
const { Account, Customer } = require("../entities");
const {
  generateToken,
  generateResetToken,
  extractEmailFromResetToken,
  validateResetToken,
} = require("../config/jwt.js");

// ==================== LOGIN ====================
const authenticate = async ({ username, password }) => {
  const account = await Account.findOne({
    where: { username },
    // include: [{ model: Customer, as: "customer" }],
  });

  if (!account) {
    const err = new Error("User not found");
    err.code = "USER_NOT_FOUND";
    throw err;
  }

  if (account.statusLogin === "LOCKED") {
    const err = new Error("Account is locked");
    err.code = "ACCOUNT_LOCKED";
    throw err;
  }

  const isMatch = await bcrypt.compare(password, account.password);
  if (!isMatch) {
    const err = new Error("Wrong password");
    err.code = "WRONG_PASSWORD";
    throw err;
  }

  // Tạo payload giống Spring Boot (scope = role)
  const token = generateToken({
    sub: account.username,
    scope: account.role, // ADMIN | USER | STAFF
    id: account.id || account.login_id,
  });

  return {
    isAuthenticated: true,
    token,
  };
};

// ==================== INTROSPECT ====================
const introspect = async ({ token }) => {
  try {
    const { verifyAccessToken } = require("../config/jwt");
    verifyAccessToken(token);
    return { valid: true };
  } catch {
    return { valid: false };
  }
};

// ==================== FORGOT PASSWORD ====================
const forgotPassword = async ({ email }, emailService) => {
  const account = await Account.findOne({
    include: [{ model: Customer, as: "customer", where: { email } }],
  });

  if (!account) {
    const err = new Error("User not found");
    err.code = "USER_NOT_FOUND";
    throw err;
  }

  // Tạo OTP 6 số
  const otp = String(Math.floor(Math.random() * 999999)).padStart(6, "0");
  const token = generateResetToken(email);

  // Gửi email
  await emailService.sendSimpleEmail(
    email,
    "Reset Password OTP",
    `Your verification code is: ${otp}`,
  );

  return { token, otp, newPassword: "" };
};

// ==================== RESET PASSWORD ====================
const resetPassword = async ({ token, otp, newPassword }) => {
  try {
    // 1. Verify token hợp lệ
    validateResetToken(token);

    // 2. Extract email
    const email = extractEmailFromResetToken(token);

    // 3. Tìm account
    const account = await Account.findOne({
      include: [{ model: Customer, as: "customer", where: { email } }],
    });

    if (!account) {
      return { code: 1, result: "Invalid token!" };
    }

    // 4. Hash và lưu password mới
    account.password = await bcrypt.hash(newPassword, 10);
    await account.save();

    return { code: 0, result: "Password has been reset successfully." };
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return { code: 1, result: "Token has expired!" };
    }
    return {
      code: 1,
      result: "An error occurred while resetting the password.",
    };
  }
};

module.exports = { authenticate, introspect, forgotPassword, resetPassword };
