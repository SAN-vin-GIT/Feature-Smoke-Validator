import yaml from 'js-yaml';
import { executeStep } from '../dsl/steps.js';
import { executeAssertion } from '../dsl/assertions.js';

const scenarios = Cypress.env('SMOKE_SCENARIOS') || [];

// Context tracking for error logging
let currentTestContext = {};

describe('Feature Smoke Validator', () => {

    beforeEach(() => {
        cy.clearAllCookies();
        cy.clearAllLocalStorage();
        cy.clearAllSessionStorage();

        cy.visit('/auth/login');
        cy.get('input[name="email"]').type(Cypress.env('USERNAME'));
        cy.get('input[name="password"]').type(
            Cypress.env('PASSWORD'),
            { log: false }
        );
        cy.get('button[type="submit"]').click();

        cy.url({ timeout: 30000 }).should('include', '/reseller');
    });

    scenarios.forEach(fileName => {

        it(`smoke: ${fileName}`, function () {
            const ctx = this;

            cy.task('loadYaml', `cypress/smoke/modules/${fileName}`).then(file => {
                const scenario = yaml.load(file);

                // GUARDED priority — set on test context so afterEach can read it
                const priority = scenario?.priority || 'medium';
                ctx.priority = priority;

                // Store context for error logging
                currentTestContext = {
                    scenarioFile: fileName,
                    module: scenario?.module || 'unknown',
                    priority: priority
                };

                // Execute steps using handler registry
                scenario.steps?.forEach((step, index) => {
                    currentTestContext.currentStep = `step[${index}]: ${Object.keys(step)[0]}`;
                    executeStep(step);
                });

                // Execute assertions using handler registry
                scenario.assertions?.forEach((assertion, index) => {
                    currentTestContext.currentStep = `assertion[${index}]: ${Object.keys(assertion)[0]}`;
                    executeAssertion(assertion);
                });

                // Don't clear context here - let afterEach handle it
            });
        });
    });

    afterEach(function () {
        if (this.currentTest.state === 'failed') {
            const priority = this.priority ?? this.currentTest?.ctx?.priority ?? 'medium';
            const title = this.currentTest.title;

            // Log the error with full context
            const errorMessage = this.currentTest.err?.message || 'Unknown error';
            const errorStack = this.currentTest.err?.stack || 'No stack trace';

            const errorLogEntry = {
                timestamp: new Date().toISOString(),
                scenarioFile: currentTestContext.scenarioFile || title,
                module: currentTestContext.module || 'unknown',
                priority: priority,
                errorName: this.currentTest.err?.name || 'Error',
                message: errorMessage.includes('\n') ? errorMessage.split('\n') : errorMessage,
                failingStep: currentTestContext.currentStep || 'unknown',
                url: 'captured in afterEach',
                stackTrace: errorStack.split('\n').slice(0, 10).map(line => line.trim()).filter(line => line)
            };

            // Log to file via cy.task
            cy.task('appendErrorLog', errorLogEntry, { log: false });

            if (priority !== 'high') {
                this.currentTest.state = 'passed';
                console.warn(
                    `NON-BLOCKING ${priority.toUpperCase()} smoke failed: ${title}`
                );
            }
        }

        // Clear context after logging (whether passed or failed)
        currentTestContext = {};
    });
});
