const accountService = require("../services/accountService");
const emailService = require("../services/emailService");

const register = async (req, res, next) => {
  try {
    const result = await accountService.addAccount(req.body);
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const result = await accountService.getAccountById(req.params.id);
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await accountService.getAllAccounts(req.query);
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

// ✅ Thêm: getMyAccount
const getMyAccount = async (req, res, next) => {
  try {
    const result = await accountService.getMyAccount(req.user.sub);
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

// ✅ Thêm: getByUsername
const getByUsername = async (req, res, next) => {
  try {
    const result = await accountService.getAccountByUsername(
      req.params.username,
    );
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

// ✅ Thêm: addByAdmin
const addByAdmin = async (req, res, next) => {
  try {
    const result = await accountService.addAccountByAdmin(req.body);
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

// ✅ Thêm: updateByAdmin
const updateByAdmin = async (req, res, next) => {
  try {
    const result = await accountService.updateAccountByAdmin(
      req.params.id,
      req.body,
    );
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

// ✅ Thêm: deleteByAdmin
const deleteByAdmin = async (req, res, next) => {
  try {
    const result = await accountService.deleteAccountByAdmin(req.params.id);
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

// ✅ Thêm: createMeeting — cần GoogleCalendarService (bỏ qua nếu chưa có)
const createMeeting = async (req, res, next) => {
  try {
    // TODO: tích hợp Google Calendar sau
    res.json({ code: 1000, message: "Not implemented yet" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  getById,
  getAll,
  getMyAccount,
  getByUsername,
  addByAdmin,
  updateByAdmin,
  deleteByAdmin,
  createMeeting,
};
