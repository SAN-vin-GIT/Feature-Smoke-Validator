const { defineConfig } = require("cypress");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

module.exports = defineConfig({
  e2e: {
    baseUrl: "YOUR URL",

    env: {
      USERNAME: "YOUR USERNAME",
      PASSWORD: "YOUR PASSWORD"
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

      // ✅ discover YAML scenarios
      const yamlFiles = fs
        .readdirSync(smokeDir)
        .filter(file => file.endsWith(".yaml"));

      // ✅ parse priority, sort high → medium → low, inject into Cypress.env
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const smokeScenarios = yamlFiles
        .map(file => {
          const raw = fs.readFileSync(
            path.join(smokeDir, file),
            "utf8"
          );
          const doc = yaml.load(raw);
          const priority = (doc?.priority || "medium").toLowerCase();
          const order = priorityOrder[priority] ?? 1;
          return { file, order, priority };
        })
        .sort((a, b) => a.order - b.order)
        .map(({ file }) => file);

      config.env.SMOKE_SCENARIOS = smokeScenarios;

      // ✅ Node-side YAML loader task
      on("task", {
        loadYaml(filePath) {
          return fs.readFileSync(
            path.resolve(filePath),
            "utf8"
          );
        }
      });

      return config;
    },
  },
});
