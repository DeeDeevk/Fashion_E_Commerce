const Account = require("./Account");
const Customer = require("./Customer");
const Address = require("./Address");
const Cart = require("./Cart");

// Account <-> Customer (1-1)
Account.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
Customer.hasOne(Account, { foreignKey: "customer_id", as: "account" });

// Cart <-> Account (1-1) — FK nằm trong bảng cart, tên cột là customer_login
Cart.belongsTo(Account, { foreignKey: "customer_login", as: "account" });
Account.hasOne(Cart, { foreignKey: "customer_login", as: "cart" });

// Account <-> Address (1-N)
Account.hasMany(Address, { foreignKey: "account_id", as: "addresses" });
Address.belongsTo(Account, { foreignKey: "account_id" });

module.exports = { Account, Customer, Address, Cart };
