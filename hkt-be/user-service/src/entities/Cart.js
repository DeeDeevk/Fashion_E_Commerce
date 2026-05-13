const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "cart_id",
    },
    totalQuantity: {
      type: DataTypes.INTEGER,
      field: "total_quantity",
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DOUBLE,
      field: "total_amount",
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
  },
  {
    tableName: "cart",
    timestamps: false,
  },
);

module.exports = Cart;
