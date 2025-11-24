/**
 * This is a test file to verify MSW imports and configuration.
 * Following the official MSW v2 documentation
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './browser';

// Log initial setup
console.log('[MSW Test] Using handlers from browser.ts');

// Setup and start the worker
console.log('[MSW Test] Setting up worker');

// Export the worker properly
export const worker = setupWorker(...handlers);

// Log to verify this file is loaded
console.log('[MSW Test] Import successful');
