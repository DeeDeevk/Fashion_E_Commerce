const { Eureka } = require("eureka-js-client");
require("dotenv").config();

const client = new Eureka({
  instance: {
    app: process.env.APP_NAME,
    instanceId: `${process.env.APP_NAME}:${process.env.PORT}`,
    hostName: "127.0.0.1",
    ipAddr: "127.0.0.1",
    port: {
      $: parseInt(process.env.PORT),
      "@enabled": true,
    },
    vipAddress: process.env.APP_NAME,
    dataCenterInfo: {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      name: "MyOwn",
    },
    statusPageUrl: `http://127.0.0.1:${process.env.PORT}/info`,
    healthCheckUrl: `http://127.0.0.1:${process.env.PORT}/health`,
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
