// backend/ecosystem.config.cjs
module.exports = {
    apps: [
      {
        name: "medalert-api",
        script: "server.js",
        instances: 1,
        autorestart: true,
        watch: false,
        env: {
          NODE_ENV: "production",
          PORT: 5000,
        },
      },
      {
        name: "medalert-worker",
        script: "worker.js",
        instances: 1,        // always 1 — multiple workers = duplicate jobs
        autorestart: true,
        watch: false,
        env: {
          NODE_ENV: "production",
        },
      },
    ],
  };