require("dotenv").config();
const express = require("express");
const cors = require("cors");
const client = require("prom-client");
const sequelize = require("./config/db");
const eurekaClient = require("./config/eureka");
const errorHandler = require("./middlewares/errorHandler");

require("./entities");

const app = express();
app.use(express.json());

// ── Prometheus metrics ──────────────────────────────────────────
client.collectDefaultMetrics({ prefix: "user_service_" });

const httpRequestCounter = new client.Counter({
  name: "user_service_http_requests_total",
  help: "Tổng số HTTP request",
  labelNames: ["method", "route", "status"],
});

const httpRequestDuration = new client.Histogram({
  name: "user_service_http_duration_seconds",
  help: "Thời gian xử lý request (giây)",
  labelNames: ["method", "route", "status"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    const labels = { method: req.method, route: req.path, status: res.statusCode };
    httpRequestCounter.inc(labels);
    end(labels);
  });
  next();
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.send(await client.register.metrics());
});
// ───────────────────────────────────────────────────────────────

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
      return sequelize.sync({ alter: false });
    })
    .then(() => {
      app.listen(PORT, () => {
        console.log(`user-service running on port ${PORT}`);
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

process.on("SIGTERM", () => eurekaClient.stop());
process.on("SIGINT", () => eurekaClient.stop());