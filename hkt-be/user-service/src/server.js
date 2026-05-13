require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const eurekaClient = require("./config/eureka");
const errorHandler = require("./middlewares/errorHandler");

// Import associations
require("./entities");

const app = express();
app.use(express.json());

// Health check endpoints (Eureka cần)
app.get("/health", (req, res) => res.json({ status: "UP" }));
app.get("/info", (req, res) => res.json({ app: process.env.APP_NAME }));

// Routes
app.use("/accounts", require("./routes/account.route.js"));
app.use("/addresses", require("./routes/address.route.js"));
app.use("/auth", require("./routes/auth.route.js"));

// Error handler (phải đặt cuối)
app.use(errorHandler);

const PORT = process.env.PORT || 8081;

sequelize
  .authenticate()
  .then(() => {
    console.log("MariaDB connected");
    return sequelize.sync({ alter: false }); // dùng alter:true nếu muốn tự update schema
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`user-service running on port ${PORT}`);
      // Đăng ký Eureka sau khi server lên
      eurekaClient.start((err) => {
        if (err) console.error("❌ Eureka registration failed:", err);
        else console.log("✅ Registered with Eureka");
      });
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => eurekaClient.stop());
process.on("SIGINT", () => eurekaClient.stop());
