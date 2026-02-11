require('dotenv').config();
const { defineConfig } = require("cypress");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL,
    viewportWidth: 1920,
    viewportHeight: 1080,

    env: {
      USERNAME: process.env.CYPRESS_USERNAME,
      PASSWORD: process.env.CYPRESS_PASSWORD
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

      /**
       * Recursively find all YAML files in a directory
       * @param {string} dir - Directory to search
       * @param {string} baseDir - Base directory for calculating relative paths
       * @returns {string[]} - Array of relative file paths
       */
      function findYamlFiles(dir, baseDir = dir) {
        let results = [];
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
          const fullPath = path.join(dir, item.name);

          if (item.isDirectory()) {
            // Recursively search subdirectories
            results = results.concat(findYamlFiles(fullPath, baseDir));
          } else if (item.isFile() && item.name.endsWith('.yaml')) {
            // Store relative path from baseDir
            const relativePath = path.relative(baseDir, fullPath);
            results.push(relativePath);
          }
        }

        return results;
      }

      //  discover YAML scenarios recursively
      const yamlFiles = findYamlFiles(smokeDir);

      //  parse priority, sort high → medium → low, inject into Cypress.env
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

      //  Node-side tasks
      on("task", {
        loadYaml(filePath) {
          return fs.readFileSync(
            path.resolve(filePath),
            "utf8"
          );
        },

        appendErrorLog(logEntry) {
          const logDir = path.join(config.projectRoot, "cypress/smoke/logs");
          const logFile = path.join(logDir, "error_logs.json");

          // Ensure log directory exists
          if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
          }

          let logs = [];

          // Read existing logs if file exists
          if (fs.existsSync(logFile)) {
            try {
              const existingContent = fs.readFileSync(logFile, "utf8");
              logs = JSON.parse(existingContent);
            } catch (err) {
              // If file is corrupted, start fresh
              console.warn("Error reading log file, starting fresh:", err.message);
            }
          }

          // Append new log entry
          logs.push(logEntry);

          // Write back to file
          fs.writeFileSync(logFile, JSON.stringify(logs, null, 2), "utf8");

          return null; // Cypress tasks must return a value
        }
      });

      return config;
    },
  },
});
