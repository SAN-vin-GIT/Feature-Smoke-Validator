import yaml from 'js-yaml';

const scenarios = Cypress.env('SMOKE_SCENARIOS') || [];

describe('Feature Smoke Validator', () => {

    before(() => {
        cy.visit('/auth/login');

        cy.get('input[name="email"]').type(Cypress.env('USERNAME'));
        cy.get('input[name="password"]').type(
            Cypress.env('PASSWORD'),
            { log: false }
        );
        cy.get('button[type="submit"]').click();
    });

    scenarios.forEach(fileName => {

        it(`smoke: ${fileName}`, () => {
            cy.readFile(`cypress/smoke/modules/${fileName}`).then(file => {
                const scenario = yaml.load(file);

                // steps
                scenario.steps.forEach(step => {
                    if (step.goto) {
                        cy.visit(step.goto);
                    }
                });

                // assertions
                if (scenario.assertions) {
                    scenario.steps.forEach(step => {

                        if (step.goto) {
                            cy.visit(step.goto);
                        }

                        if (step.click) {
                            cy.get(step.click).click();
                        }

                    });
                }
            });
        });

    });

});
