const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Address = sequelize.define(
  "Address",
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    province: { type: DataTypes.STRING },
    delivery_address: { type: DataTypes.STRING },
    delivery_note: { type: DataTypes.STRING },
  },
  {
    tableName: "address",
    timestamps: false,
  },
);

module.exports = Address;
