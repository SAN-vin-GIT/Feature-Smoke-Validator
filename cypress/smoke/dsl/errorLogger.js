/**
 * Error Logger Utility
 * 
 * Captures error details during smoke test execution and sends them
 * to a Cypress task for persistent storage.
 */

/**
 * Log an error to the persistent error log file
 * @param {Object} errorData - The error information to log
 * @param {string} errorData.scenarioFile - The YAML file that was running
 * @param {string} errorData.module - The module name from YAML
 * @param {string} errorData.priority - Test priority (high/medium/low)
 * @param {Error} errorData.error - The error object
 * @param {string} errorData.failingStep - The step that failed (if known)
 * @param {string} errorData.url - Current URL at time of failure
 */
export function logError(errorData) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        scenarioFile: errorData.scenarioFile || 'unknown',
        module: errorData.module || 'unknown',
        priority: errorData.priority || 'medium',
        errorName: errorData.error?.name || 'Error',
        message: errorData.error?.message || 'Unknown error',
        failingStep: errorData.failingStep || 'unknown',
        url: errorData.url || window.location.href,
        // Truncate stack trace to first 500 chars to keep log manageable
        stack: errorData.error?.stack?.substring(0, 500) || 'No stack trace'
    };

    // Send to Node-side task for file writing
    cy.task('appendErrorLog', logEntry, { log: false }).catch(err => {
        // Don't fail the test if logging fails
        console.error('Failed to write error log:', err);
    });
}
