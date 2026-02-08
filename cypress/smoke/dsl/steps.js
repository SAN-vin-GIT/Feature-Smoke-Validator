
export const stepHandlers = {
    /**
     * Navigate to a URL
     * @param {string} path - The path to navigate to
     */
    goto: (path) => {
        cy.visit(path, { timeout: 60000 });
    },

    /**
     * Click an element
     * @param {string} selector - CSS selector or data-cy attribute
     */
    click: (selector) => {
        cy.get(selector, { timeout: 20000 }).click();
    },

    /**
     * Toggle the sidebar
     * @param {boolean} value - true to toggle sidebar
     */
    sidebar: (value) => {
        if (value) {
            cy.get('[data-cy="button-sidebar-toggle"]', { timeout: 20000 }).click({ force: true });
        }
    },

    // Wait for an element to exist (useful for dynamic content)
    wait_for: (selector) => {
        cy.get(selector, { timeout: 30000 }).should('exist');
    },

    // Type text into an input field
    type: (config) => {
        const selector = typeof config === 'string' ? config : config.selector;
        const text = typeof config === 'object' ? config.text : '';

        cy.get(selector, { timeout: 20000 }).type(text);
    },

    // Click if element is visible (non-blocking)
    click_if_visible: (selector) => {
        cy.get('body').then($body => {
            if ($body.find(selector).length > 0) {
                cy.get(selector).click();
            }
        });
    },

    // Open a specific module (semantic shorthand)
    open_module: (moduleName) => {
        cy.get(`[data-cy="button-sidebar-${moduleName}"]`, { timeout: 20000 }).click();
    },

    // Scroll to element
    scroll_to: (selector) => {
        cy.get(selector, { timeout: 20000 }).scrollIntoView();
    },


    // Add your custom step handlers below this line
    // Example:
    // wait_for: (selector) => cy.get(selector, { timeout: 30000 }).should('exist'),
};

/**
 * Execute a step based on its type
 * @param {Object} step - The step object from YAML
 */
export function executeStep(step) {
    const stepType = Object.keys(step)[0];
    const handler = stepHandlers[stepType];

    if (!handler) {
        throw new Error(`Unknown step type: ${stepType}`);
    }

    handler(step[stepType]);
}

/**
 * Step Handlers Registry
 * 
 * ====================================================================================
 * HOW TO ADD A NEW STEP TYPE
 * ====================================================================================
 * 
 * 1. Add a new entry to the `stepHandlers` object below
 * 2. The key is the step name that will be used in YAML (e.g., 'click', 'goto')
 * 3. The value is a function that receives the step config from YAML
 * 4. Inside the function, write Cypress commands to execute the step
 * 
 * EXAMPLE - Adding a "wait_for" step:
 * 
 *   wait_for: (selector) => {
 *     cy.get(selector, { timeout: 30000 }).should('exist');
 *   },
 * 
 * YAML Usage:
 *   steps:
 *     - wait_for: '[data-cy="table-loaded"]'
 * 
 * ====================================================================================
 * STEP DESIGN PRINCIPLES
 * ====================================================================================
 * 
 * ✅ DO:
 *   - Keep steps simple and focused on ONE action
 *   - Use semantic names (e.g., 'open_module' not 'click_sidebar_then_module')
 *   - Add reasonable timeouts for reliability
 *   - Support both simple values and complex objects when needed
 *   - Add JSDoc comments for clarity
 * 
 * ❌ DON'T:
 *   - Create steps that do multiple unrelated things
 *   - Hardcode selectors (accept them as parameters)
 *   - Make steps that validate business logic (use assertions for that)
 *   - Create steps that require complex configuration
 * 
 * ====================================================================================
 * ADVANCED EXAMPLE - Step with complex config:
 * ====================================================================================
 * 
 *   store_text: (config) => {
 *     const selector = typeof config === 'string' ? config : config.selector;
 *     const alias = typeof config === 'object' ? config.as : 'storedText';
 *     
 *     cy.get(selector).invoke('text').then(text => {
 *       cy.wrap(text.trim()).as(alias);
 *     });
 *   },
 * 
 * YAML Usage (simple):
 *   steps:
 *     - store_text: 'table tbody tr:first td:first'
 * 
 * YAML Usage (complex):
 *   steps:
 *     - store_text:
 *         selector: 'table tbody tr:first td:first'
 *         as: 'companyName'
 * 
 * ====================================================================================
 */



/*

// Store text from an element for later use
store_text: (config) => {
  const selector = typeof config === 'string' ? config : config.selector;
  const alias = typeof config === 'object' ? config.as : 'storedText';
  
  cy.get(selector).invoke('text').then(text => {
    cy.wrap(text.trim()).as(alias);
  });
},

// Select option from dropdown
select: (config) => {
  cy.get(config.selector, { timeout: 20000 }).select(config.value);
},


// Ensure sidebar is open (infrastructure helper)
ensure_sidebar_open: () => {
  cy.get('body').then($body => {
    // Check if sidebar is collapsed
    if ($body.find('[data-cy="button-sidebar-toggle"]').length > 0) {
      cy.get('[data-cy="button-sidebar-toggle"]').click({ force: true });
    }
  });
},

// Wait for a specific amount of time (use sparingly!)
wait: (milliseconds) => {
  cy.wait(milliseconds);
},
*/