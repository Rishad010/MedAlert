// backend/ecosystem.config.cjs
// Agenda runs inside server.js (single process). Do not add worker.js here or jobs will run twice.
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
  ],
};
