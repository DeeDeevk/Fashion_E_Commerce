const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "customer_id",
    },
    fullName: { type: DataTypes.STRING, field: "full_name" },
    phoneNumber: { type: DataTypes.STRING, field: "phone_number" },
    email: { type: DataTypes.STRING },
    gender: { type: DataTypes.ENUM("MALE", "FEMALE", "OTHER") },
    dateOfBirth: { type: DataTypes.DATE, field: "date_of_birth" },
    createAt: { type: DataTypes.DATE, field: "create_at" },
    updateAt: { type: DataTypes.DATE, field: "update_at" },
    status: { type: DataTypes.ENUM("ACTIVE", "INACTIVE") },
  },
  {
    tableName: "customer",
    timestamps: false,
  },
);

module.exports = Customer;
