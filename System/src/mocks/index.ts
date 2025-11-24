// Initialize MSW in the browser
// Temporarily using test worker to diagnose issues
import { worker } from './msw-test';

// Log debug information
console.log('[MSW] Worker imported successfully');

// Start the worker with proper error handling
console.log('[MSW] Starting mock service worker...');
worker.start({
  onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
})
.catch((error) => {
  console.error('[MSW] Failed to start:', error);
});
