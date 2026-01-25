const { defineConfig } = require("cypress");
const fs = require("fs");
const path = require("path");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://shop-a5it.sta5sync.com/reseller",
    env: {
      USERNAME: "s.ghimire@a5it.com",
      PASSWORD: "Password@12345"
    },
    specPattern: [
      "cypress/e2e/**/*.cy.js",
      "cypress/smoke/**/*.cy.js"
    ],
    setupNodeEvents(on, config) {
      const smokeDir = path.join(
        config.projectRoot,
        "cypress/smoke/modules"
      );

      const smokeScenarios = fs
        .readdirSync(smokeDir)
        .filter(file => file.endsWith(".yaml"));

      // 👇 inject into env BEFORE specs load
      config.env.SMOKE_SCENARIOS = smokeScenarios;

      return config;
    },
  },
});
