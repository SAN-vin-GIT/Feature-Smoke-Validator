// Import commands.js using ES2015 syntax:
import './commands'
import '@testing-library/cypress/add-commands'


Cypress.on('uncaught:exception', (err, runnable) => {
    return false
})
