const { Eureka } = require("eureka-js-client");
require("dotenv").config();

const host = process.env.EUREKA_INSTANCE_IP_ADDRESS || "127.0.0.1";
const port = parseInt(process.env.PORT);

const client = new Eureka({
  instance: {
    app: process.env.APP_NAME,
    instanceId: `${process.env.APP_NAME}:${port}`,
    hostName: host, // ← đổi từ hardcode "127.0.0.1"
    ipAddr: host, // ← đổi từ hardcode "127.0.0.1"
    port: {
      $: port,
      "@enabled": true,
    },
    vipAddress: process.env.APP_NAME,
    dataCenterInfo: {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      name: "MyOwn",
    },
    statusPageUrl: `http://${host}:${port}/info`, // ← cập nhật theo
    healthCheckUrl: `http://${host}:${port}/health`, // ← cập nhật theo
  },
  eureka: {
    host: process.env.EUREKA_HOST,
    port: process.env.EUREKA_PORT,
    servicePath: "/eureka/apps/",
    maxRetries: 5,
    requestRetryDelay: 2000,
  },
});

module.exports = client;
