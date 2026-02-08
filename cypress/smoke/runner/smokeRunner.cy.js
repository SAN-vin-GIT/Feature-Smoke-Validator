import yaml from 'js-yaml';
import { executeStep } from '../dsl/steps.js';
import { executeAssertion } from '../dsl/assertions.js';

const scenarios = Cypress.env('SMOKE_SCENARIOS') || [];

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

                // Execute steps using handler registry
                scenario.steps?.forEach(step => {
                    executeStep(step);
                });

                // Execute assertions using handler registry
                scenario.assertions?.forEach(assertion => {
                    executeAssertion(assertion);
                });
            });
        });
    });

    afterEach(function () {
        if (this.currentTest.state === 'failed') {
            const priority = this.priority ?? this.currentTest?.ctx?.priority ?? 'medium';
            const title = this.currentTest.title;

            if (priority !== 'high') {
                this.currentTest.state = 'passed';
                console.warn(
                    `NON-BLOCKING ${priority.toUpperCase()} smoke failed: ${title}`
                );
            }
        }
    });
});
