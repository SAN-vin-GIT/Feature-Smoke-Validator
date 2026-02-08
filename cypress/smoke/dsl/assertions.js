
export const assertionHandlers = {
    /**
     * Assert that text is visible on the page
     * @param {string|Object} config - Text to find, or object with text and timeout
     */
    visible: (config) => {
        const text = typeof config === 'string' ? config : config.text;
        const timeout = typeof config === 'object' ? config.timeout || 20000 : 20000;

        cy.contains(text, { timeout }).should('be.visible');
    },

    /**
     * Assert that URL contains a specific value
     * @param {string|Object} config - Value to check, or object with value and timeout
     */
    url_contains: (config) => {
        const value = typeof config === 'string' ? config : config.value;
        const timeout = typeof config === 'object' ? config.timeout || 30000 : 30000;

        cy.url({ timeout }).should('include', value);
    },

    // Assert element contains specific text
    contains_text: (config) => {
        cy.get(config.selector).should('contain', config.text);
    },

    // Add your custom assertion handlers below this line
    // Example:
    // element_exists: (selector) => cy.get(selector).should('exist'),
};

/**
 * Execute an assertion based on its type
 * @param {Object} assertion - The assertion object from YAML
 */
export function executeAssertion(assertion) {
    const assertionType = Object.keys(assertion)[0];
    const handler = assertionHandlers[assertionType];

    if (!handler) {
        throw new Error(`Unknown assertion type: ${assertionType}`);
    }

    handler(assertion[assertionType]);
}

/**
 * Assertion Handlers Registry
 * 
 * ====================================================================================
 * HOW TO ADD A NEW ASSERTION TYPE
 * ====================================================================================
 * 
 * 1. Add a new entry to the `assertionHandlers` object below
 * 2. The key is the assertion name that will be used in YAML (e.g., 'visible', 'url_contains')
 * 3. The value is a function that receives the assertion config from YAML
 * 4. Inside the function, write Cypress assertions to verify the condition
 * 
 * EXAMPLE - Adding an "element_exists" assertion:
 * 
 *   element_exists: (selector) => {
 *     cy.get(selector).should('exist');
 *   },
 * 
 * YAML Usage:
 *   assertions:
 *     - element_exists: '[data-cy="customer-table"]'
 * 
 * ====================================================================================
 * ASSERTION DESIGN PRINCIPLES
 * ====================================================================================
 * 
 * ✅ DO:
 *   - Keep assertions focused on structural/availability checks
 *   - Use reasonable timeouts (smoke tests should be fast but reliable)
 *   - Support both simple strings and complex objects with timeouts
 *   - Add JSDoc comments for clarity
 *   - Make assertions that answer "Is this feature rendered?"
 * 
 * ❌ DON'T:
 *   - Create assertions that validate business logic or data correctness
 *   - Make assertions that require complex setup or state
 *   - Create assertions that are too specific to one feature
 *   - Validate exact text matches (use 'contains' instead)
 * 
 * ====================================================================================
 * ADVANCED EXAMPLE - Assertion with timeout config:
 * ====================================================================================
 * 
 *   not_visible: (config) => {
 *     const text = typeof config === 'string' ? config : config.text;
 *     const timeout = typeof config === 'object' ? config.timeout || 10000 : 10000;
 *     
 *     cy.contains(text, { timeout }).should('not.be.visible');
 *   },
 * 
 * YAML Usage (simple):
 *   assertions:
 *     - not_visible: 'Loading...'
 * 
 * YAML Usage (complex with timeout):
 *   assertions:
 *     - not_visible:
 *         text: 'Loading...'
 *         timeout: 5000
 * 
 * ====================================================================================
 * COMMON ASSERTION PATTERNS
 * ====================================================================================
 * 
 * Element visibility:
 *   cy.get(selector).should('be.visible')
 *   cy.contains(text).should('be.visible')
 * 
 * Element existence (doesn't need to be visible):
 *   cy.get(selector).should('exist')
 * 
 * URL checks:
 *   cy.url().should('include', '/path')
 *   cy.url().should('match', /regex/)
 * 
 * Count checks:
 *   cy.get(selector).should('have.length', count)
 *   cy.get(selector).should('have.length.greaterThan', 0)
 * 
 * Attribute checks:
 *   cy.get(selector).should('have.attr', 'disabled')
 *   cy.get(selector).should('have.class', 'active')
 * 
 * ====================================================================================
 */

/*
// Assert element exists (doesn't need to be visible)
element_exists: (selector) => {
  cy.get(selector).should('exist');
},

// Assert element does not exist
element_not_exists: (selector) => {
  cy.get(selector).should('not.exist');
},

// Assert text is NOT visible
not_visible: (config) => {
  const text = typeof config === 'string' ? config : config.text;
  const timeout = typeof config === 'object' ? config.timeout || 10000 : 10000;
  
  cy.contains(text, { timeout }).should('not.be.visible');
},

// Assert element count
count: (config) => {
  cy.get(config.selector).should('have.length', config.count);
},

// Assert minimum element count
min_count: (config) => {
  cy.get(config.selector).should('have.length.greaterThan', config.min - 1);
},

// Assert element has specific class
has_class: (config) => {
  cy.get(config.selector).should('have.class', config.class);
},

// Assert element is disabled
is_disabled: (selector) => {
  cy.get(selector).should('be.disabled');
},

// Assert element is enabled
is_enabled: (selector) => {
  cy.get(selector).should('not.be.disabled');
},

// Assert URL matches regex
url_matches: (config) => {
  const pattern = typeof config === 'string' ? config : config.pattern;
  const timeout = typeof config === 'object' ? config.timeout || 30000 : 30000;
  
  cy.url({ timeout }).should('match', new RegExp(pattern));
},

// Assert page title contains text
title_contains: (text) => {
  cy.title().should('include', text);
},


*/