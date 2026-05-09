const bcrypt = require("bcrypt");
const { Account, Customer, Cart } = require("../entities");

const addAccount = async (accountRequest) => {
  const exists = await Account.findOne({
    where: { username: accountRequest.username },
  });
  const emailExists = await Customer.findOne({
    where: { email: accountRequest.customer.email },
  });
  if (exists || emailExists) {
    const err = new Error("User already exists");
    err.code = "USER_EXISTED";
    throw err;
  }

  const hashedPassword = await bcrypt.hash(accountRequest.password, 10);
  const now = new Date();

  const customer = await Customer.create({
    ...accountRequest.customer,
    createAt: now,
    updateAt: now,
    status: "ACTIVE",
  });

  const account = await Account.create({
    username: accountRequest.username,
    password: hashedPassword,
    role: "USER",
    statusLogin: "ACTIVE",
    createAt: now,
    updateAt: now,
    customer_id: customer.id,
  });

  await Cart.create({
    customer_login: account.id,
    totalAmount: 0,
    totalQuantity: 0,
    createdAt: now,
    updatedAt: now,
  });

  return getAccountById(account.id);
};

const getAccountById = async (id) => {
  return Account.findByPk(id, {
    include: [{ model: Customer, as: "customer" }],
    attributes: { exclude: ["password"] },
  });
};

const getAccountByUsername = async (username) => {
  const account = await Account.findOne({
    where: { username },
    include: [{ model: Customer, as: "customer" }],
    attributes: { exclude: ["password"] },
  });
  if (!account)
    throw Object.assign(new Error("User not found"), {
      code: "USER_NOT_FOUND",
    });
  return account;
};

const getAllAccounts = async ({ name, status, role } = {}) => {
  const accounts = await Account.findAll({
    include: [{ model: Customer, as: "customer" }],
    attributes: { exclude: ["password"] },
  });

  return accounts
    .filter((a) => a.id !== 1)
    .filter(
      (a) =>
        !name ||
        a.customer?.fullName?.toLowerCase().includes(name.toLowerCase()),
    )
    .filter((a) => !status || a.statusLogin === status)
    .filter((a) => !role || a.role === role);
};

// ✅ Thêm: getMyAccount — lấy từ token
const getMyAccount = async (username) => {
  return getAccountByUsername(username);
};

// ✅ Thêm: addAccountByAdmin
const addAccountByAdmin = async (accountRequest) => {
  const exists = await Account.findOne({
    where: { username: accountRequest.username },
  });
  const emailExists = await Customer.findOne({
    where: { email: accountRequest.customer.email },
  });
  if (exists || emailExists) {
    const err = new Error("User already exists");
    err.code = "USER_EXISTED";
    throw err;
  }

  const hashedPassword = await bcrypt.hash(accountRequest.password, 10);
  const now = new Date();

  const customer = await Customer.create({
    ...accountRequest.customer,
    createAt: now,
    updateAt: now,
    status: "ACTIVE",
  });

  const account = await Account.create({
    username: accountRequest.username,
    password: hashedPassword,
    role: accountRequest.role || "USER",
    statusLogin: "ACTIVE",
    createAt: now,
    updateAt: now,
    customer_id: customer.id,
  });

  await Cart.create({
    customer_login: account.id,
    totalAmount: 0,
    totalQuantity: 0,
    createdAt: now,
    updatedAt: now,
  });

  return getAccountById(account.id);
};

// ✅ Thêm: updateAccountByAdmin
const updateAccountByAdmin = async (id, accountRequest) => {
  const account = await Account.findByPk(id, {
    include: [{ model: Customer, as: "customer" }],
  });
  if (!account)
    throw Object.assign(new Error("User not found"), {
      code: "USER_NOT_FOUND",
    });

  // Kiểm tra trùng username
  if (account.username !== accountRequest.username) {
    const exists = await Account.findOne({
      where: { username: accountRequest.username },
    });
    if (exists)
      throw Object.assign(new Error("User already exists"), {
        code: "USER_EXISTED",
      });
  }

  account.username = accountRequest.username;
  account.role = accountRequest.role;
  account.statusLogin = accountRequest.statusLogin;
  account.updateAt = new Date();

  if (accountRequest.password && accountRequest.password.trim() !== "") {
    account.password = await bcrypt.hash(accountRequest.password, 10);
  }

  // Cập nhật Customer
  const customer = account.customer;
  customer.fullName = accountRequest.customer.fullName;
  customer.email = accountRequest.customer.email;
  customer.phoneNumber = accountRequest.customer.phoneNumber;
  customer.gender = accountRequest.customer.gender;
  customer.dateOfBirth = accountRequest.customer.dateOfBirth;
  customer.updateAt = new Date();
  await customer.save();
  await account.save();

  return getAccountById(id);
};

// ✅ Thêm: deleteAccountByAdmin (soft delete — LOCKED)
const deleteAccountByAdmin = async (id) => {
  const account = await Account.findByPk(id);
  if (!account)
    throw Object.assign(new Error("User not found"), {
      code: "USER_NOT_FOUND",
    });

  account.statusLogin = "LOCKED";
  account.updateAt = new Date();
  await account.save();

  return getAccountById(id);
};

// ✅ Thêm: getAllEmployees
const getAllEmployees = async () => {
  const accounts = await Account.findAll({
    where: { role: "STAFF" },
    include: [{ model: Customer, as: "customer" }],
  });
  return accounts.map((a) => a.customer);
};

// ✅ Thêm: findAccountByCustomerEmail
const findAccountByCustomerEmail = async (email) => {
  const account = await Account.findOne({
    include: [{ model: Customer, as: "customer", where: { email } }],
  });
  if (!account)
    throw Object.assign(new Error("User not found"), {
      code: "USER_NOT_FOUND",
    });
  return account;
};

// ✅ Thêm: saveAccount
const saveAccount = async (account) => {
  return account.save();
};

// ✅ Thêm: getAccountByAccountId
const getAccountByAccountId = async (id) => {
  const account = await Account.findByPk(id);
  if (!account)
    throw Object.assign(new Error("User not found"), {
      code: "USER_NOT_FOUND",
    });
  return account;
};

module.exports = {
  addAccount,
  getAccountById,
  getAccountByUsername,
  getAllAccounts,
  getMyAccount,
  addAccountByAdmin,
  updateAccountByAdmin,
  deleteAccountByAdmin,
  getAllEmployees,
  findAccountByCustomerEmail,
  saveAccount,
  getAccountByAccountId,
};
