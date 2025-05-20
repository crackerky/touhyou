// This file sets up polyfills needed for Node.js compatibility in the browser
import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;

// Add any other polyfills we might need here
window.process = window.process || { env: {} };
window.global = window.global || window;