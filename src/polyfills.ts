// Set up global object before any other polyfills
window.global = window;

// This file sets up polyfills needed for Node.js compatibility in the browser
import { Buffer } from 'buffer';

// Make sure global objects are properly defined
window.globalThis = window.globalThis || window;
window.process = window.process || { env: {} };

// Make Buffer available globally
window.Buffer = window.Buffer || Buffer;

// Debug polyfill initialization
console.log('Initializing polyfills...');
console.log('Buffer polyfill loaded:', typeof Buffer !== 'undefined');

// Ensure proper inheritance for EventEmitter (used by streams)
if (typeof window.Object.setPrototypeOf !== 'function') {
  window.Object.setPrototypeOf = function(obj, proto) {
    if (obj.__proto__) {
      obj.__proto__ = proto;
      return obj;
    }
    
    if (Object.create) {
      return Object.create(proto);
    }
    
    throw new Error('Cannot set prototype');
  };
}

// Polyfill for TextEncoder if needed
if (typeof window.TextEncoder === 'undefined') {
  try {
    window.TextEncoder = TextEncoder;
    console.log('TextEncoder polyfill loaded');
  } catch (e) {
    console.warn('TextEncoder polyfill failed:', e);
  }
}

// Check for Cardano API
window.addEventListener('DOMContentLoaded', () => {
  console.log('Checking Cardano API availability:', typeof window.cardano !== 'undefined');
  if (window.cardano) {
    console.log('Available wallets:', Object.keys(window.cardano));
  }
});