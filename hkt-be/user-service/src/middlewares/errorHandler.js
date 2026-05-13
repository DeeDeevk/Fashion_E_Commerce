const errorHandler = (err, req, res, next) => {
  // src/middlewares/errorHandler.js
  const errorMap = {
    USER_EXISTED: { code: 1002, status: 400, message: "User already exists" },
    USER_NOT_FOUND: { code: 1005, status: 404, message: "User not found" },
    ADDRESS_NOT_FOUND: {
      code: 1008,
      status: 404,
      message: "Address not found",
    },
    ACCOUNT_LOCKED: { code: 1009, status: 403, message: "Account is locked" },
    WRONG_PASSWORD: { code: 1010, status: 401, message: "Wrong password" },
  };

  const mapped = errorMap[err.code];
  if (mapped) {
    return res
      .status(mapped.status)
      .json({ code: mapped.code, message: mapped.message });
  }

  console.error(err);
  res.status(500).json({ code: 9999, message: "Internal server error" });
};

module.exports = errorHandler;
