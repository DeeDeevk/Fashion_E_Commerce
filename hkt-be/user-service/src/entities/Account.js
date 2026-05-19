const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Account = sequelize.define(
  "Account",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "login_id",
    },
    username: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.ENUM("ADMIN", "USER", "STAFF") },
    createAt: { type: DataTypes.DATE, field: "create_at" },
    updateAt: { type: DataTypes.DATE, field: "update_at" },
    statusLogin: {
      type: DataTypes.ENUM("ACTIVE", "LOCKED"),
      field: "status_login",
    },
  },
  {
    tableName: "account",
    timestamps: false,
  },
);

module.exports = Account;
