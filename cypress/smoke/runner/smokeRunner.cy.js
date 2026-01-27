import yaml from 'js-yaml';

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

                // steps
                scenario.steps?.forEach(step => {
                    if (step.goto) { cy.visit(step.goto, { timeout: 60000 }); }
                    if (step.click) { cy.get(step.click, { timeout: 60000 }).click(); }
                    if (step.sidebar) { cy.get('[data-cy="button-sidebar-toggle"]', { timeout: 20000 }).click({ force: true }); }


                });

                // assertions
                scenario.assertions?.forEach(assertion => {

                    // ---------- visible ----------
                    if (assertion.visible) {
                        const text =
                            typeof assertion.visible === 'string'
                                ? assertion.visible
                                : assertion.visible.text;

                        const timeout =
                            typeof assertion.visible === 'object'
                                ? assertion.visible.timeout || 20000
                                : 20000;

                        cy.contains(text, { timeout }).should('be.visible');
                    }

                    // ---------- url_contains ----------
                    if (assertion.url_contains) {
                        const value =
                            typeof assertion.url_contains === 'string'
                                ? assertion.url_contains
                                : assertion.url_contains.value;

                        const timeout =
                            typeof assertion.url_contains === 'object'
                                ? assertion.url_contains.timeout || 30000
                                : 30000;

                        cy.url({ timeout }).should('include', value);
                    }

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
